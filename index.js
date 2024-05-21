/**
 * @typedef {{
 *    start:Node;
 *    start_offset:number;
 *    end: Node;
 *    end_offset:number
 *  }} SelectionInfo
 *
 *  @typedef {{
 *    target?: Node;
 *    event_name?: string;
 *    debounce?: number;
 *  }} EventOptions
 *
 *  @typedef {{
 *    stop_it_get_some_help: () => void;
 *  }} EventCancellationHandle
 */

/**
 * @param {() => void} action
 * @param {number} timeout
 * @returns {{update: {():void}}}
 */
function create_debouncer(action, timeout) {
  /** @type {number} **/
  let timer_id;

  return {
    update: () => {
      if (timer_id !== undefined) {
        clearTimeout(timer_id);
      }

      timer_id = setTimeout(() => action(), timeout);
    },
  };
}

/**
 * Gets current selection. But, swaps anchor and focus nodes if necessary.
 * @returns {SelectionInfo | undefined}
 **/
function get_selection() {
  const selection = window.getSelection();

  if (selection) {
    if (!selection.anchorNode || !selection.focusNode) {
      return undefined;
    }

    let node_order;

    if (selection.anchorNode === selection.focusNode) {
      if (selection.anchorOffset === selection.focusOffset) {
        return undefined;
      } else {
        node_order = selection.anchorOffset < selection.focusOffset ? 4 : 2;
      }
    } else {
      node_order = selection.anchorNode.compareDocumentPosition(
        selection.focusNode,
      );
    }

    switch (node_order) {
      case 4:
        return {
          start: selection.anchorNode,
          end: selection.focusNode,
          start_offset: selection.anchorOffset,
          end_offset: selection.focusOffset,
        };
      case 2:
        return {
          start: selection.focusNode,
          end: selection.anchorNode,
          start_offset: selection.focusOffset,
          end_offset: selection.anchorOffset,
        };
      default:
        return undefined;
    }
  } else {
    return undefined;
  }
}

/**
 * Checks if selection is part of the target Node tree.
 * @param {Node} target
 * @param {SelectionInfo} selection
 * @returns {boolean}
 */
function contains(target, selection) {
  return (
    (target === selection.start || target.contains(selection.start)) &&
    (target === selection.end || target.contains(selection.end))
  );
}

/**
 * Gets current active selection and checks if selection style matches with target user behavior.
 * @param {Node} [target]
 * @returns {boolean} - Returns true if behavior matches, otherwise returns false.
 */
export function detect_prime(target) {
  const selection = get_selection();

  if (
    !selection ||
    selection.start_offset === 0 ||
    (target && !contains(target, selection))
  ) {
    return false;
  }

  const start_token_0 =
    selection.start_offset > 1
      ? selection.start.textContent?.codePointAt(selection.start_offset - 2)
      : undefined;

  if (!is_terminal_char(start_token_0)) {
    return false;
  }

  const start_token_1 = selection.start.textContent?.codePointAt(
    selection.start_offset - 1,
  );

  if (is_terminal_char(start_token_1)) {
    return false;
  }

  const end_token_0 = selection.end.textContent?.codePointAt(
    selection.end_offset,
  );

  if (is_terminal_char(end_token_0)) {
    return false;
  }

  const end_token_1 = selection.end.textContent?.codePointAt(
    selection.end_offset + 1,
  );

  if (!is_terminal_char(end_token_1)) {
    return false;
  }

  return true;
}

/**
 * RegExp? Never heard it?
 * @param {number | undefined | null} value
 * @returns {boolean}
 **/
function is_terminal_char(value) {
  switch (value) {
    case 0x0009:
    case 0x000a:
    case 0x000b:
    case 0x000c:
    case 0x000d:
    case 0x002c:
    case 0x002e:
    case 0x0020:
    case 0x0021:
    case 0x0022:
    case 0x0027:
    case 0x0028:
    case 0x0029:
    case 0x003a:
    case 0x003b:
    case 0x003f:
    case 0x005b:
    case 0x005d:
    case 0x0060:
    case 0x007b:
    case 0x007d:
    case 0x00a0:
    case 0x00b4:
    case 0x1680:
    case 0x2000:
    case 0x2001:
    case 0x2002:
    case 0x2003:
    case 0x2004:
    case 0x2005:
    case 0x2006:
    case 0x2007:
    case 0x2008:
    case 0x2009:
    case 0x200a:
    case 0x2018:
    case 0x2019:
    case 0x201c:
    case 0x201d:
    case 0x2028:
    case 0x2029:
    case 0x202f:
    case 0x205f:
    case 0x3000:
    case 0xfeff:
    case undefined:
      return true;
    default:
      return false;
  }
}

/**
 * Initialize detection listener and event dispatcher.
 * @param {EventOptions} [options] - Custom event options.
 * @returns {EventCancellationHandle} - Remove handle for disabling event listener.
 **/
export function init_listener(options) {
  const debounce = options?.debounce ?? 1000;
  const event_name = options?.event_name ?? "brazil-mentioned";
  const event_target = options?.target ?? window;
  const target = options?.target;

  let debouncer = create_debouncer(() => {
    if (detect_prime(target)) {
      event_target.dispatchEvent(
        new CustomEvent(event_name, { bubbles: true }),
      );
    }
  }, debounce);

  document.addEventListener("selectionchange", debouncer.update);

  return {
    stop_it_get_some_help: () => {
      document.removeEventListener(event_name, debouncer.update);
    },
  };
}

/**
 * Calls event cancellation function for you...
 * @param {EventCancellationHandle} handle
 * @returns {void}
 */
export function remove_listener(handle) {
  handle.stop_it_get_some_help();
}
