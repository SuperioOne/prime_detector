# Prime Detection (No, it's nothing to the with prime numbers)

Basic tracker to detect users with OCD triggering text selection behaviors.

## Usage - Browser

Add `prime_detector.min.js` and use global `prime_detector` to setup your handlers.

```javascript
<!DOCTYPE html>
<html lang="">
  <head>
    <meta charset="utf-8">
    <script src="https://unpkg.com/prime_detector@0.69.101/dist/prime_detector.min.js" ></script>
    <script type="text/javascript">
         prime_detector.init_listener();
         window.addEventListener("brazil-mentioned", () => { alert("Hit!"); });
    </script>
  </head>
  <body>
    <header></header>
    <main>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
    </main>
  </body>
</html>
```

## Usage - ES/CommonJS/Bloatware

Install, import, initialize and listen for events.

```javascript
import {init_listener} from "prime_detector";

const handle = init_listener();

window.addEventListener("brazil-mentioned", () => {
    console.debug("Potential prime user detected.");
    // Generate unique finger-print, display memes, idk use your imagination.
});

// handle.stop_it_get_some_help(); // You can always stop the event listener with returned handle object.
```

## Customizing the listener

By default, `init_listener` listens `selectionchange` event on `document` and dispatches custom `brazil-mentioned` event on `window`. You can customize event names, targets and source nodes, event rate etc.

```javascript
const options = {
    target: my_article,    // Target DOM node to dispatch events. Default is 'window'.
    source: my_article,    // Source DOM node to attach 'selectionchange' event. Default is 'document'.
    debounce: 1500,        // Selection event debounce time. Default is 1000 milliseconds.
    event_name: "gotcha"   // Custom event name. Default event name is 'brazil-mentioned' to make it more immersive.
}
```

## Custom

If you don't want to use global event listener, you can always call the detection check manually.

```javascript
import {detect_prime} from "prime_detector";

function your_own_trigger(){
    if (detect_prime()) {
        alert("HIT");
    } else {
        console.debug("Just a regular normie.");
    }
}
```
