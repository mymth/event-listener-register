# Event Listener Register

Add event listeners with name and remove them by name in native JavaScript.

This module is intended for a support tool to rewrite jQuery dependent programs in native JavaScript.

The module provides wrapper functions for `EventTarget.addEventListener()` and `removeEventListener()` that allow users to manage event listeners by name and handle multiple listeners in a single call. It also retains added listeners internally with WeakMap using event target for the key.

## Usage

For Node.js, install the package using npm

```sh
npm install --save event-listener-register
```

and import the functions.

```javascript
import { addListener, removeListener } from 'event-listener-register/listener-register';

// or import as CommonJS module
const { addListener, removeListener } = require('event-listener-register');
```

For browser, load the package from CDN and expose the functions.

```html
<script src="https://cdn.jsdelivr.net/npm/event-listener-register/dist/listener-register.min.js"></script>
<script>
  var { addListener, removeListener } = listenerRegsiter;
</script>
```

Then, use the functions…

_To add listener:_
```javascript
// add a listener
addListener(el, 'click', onClick, 'myListener');

// add a listener for capture phase
addListener(el, 'mouseenter', onMouseEnter, true, 'myListener');
addListener(el, 'mouseleave', onMouseLeave, {capture: true}, 'myListener');

// add a listener to multiple event types
addListener(el, 'click touchstart', onClick, 'myListener');
addListener(el, 'mouseenter mouseleave', onMouseEnter, true);

// add a listener using name as type suffix
addListener(el, 'blur.myListener', onBlur);
addListener(el, 'mouseenter.myListener', onMouseEnter, true);
addListener(el, 'click.myListener touchstart.myListener', onClick);

// add a listener without name
addListener(el, 'click', onClick);
addListener(el, 'mouseenter', onMouseEnter, {capture: true});

// add multiple listeners
// with array
addListener(el, [
  ['click', onClick, 'myListener'],
  ['blur.myListener', onBlur],
  ['mouseenter', onMouseEnter, {capture: true}, 'myListener'],
  ['click touchstart', onClick2],
]);

// with object
// (note: listeners for capture phase are not supprted)
addListener(el, {
  click: onClick,
  'blur.myListener': onBlur,
  mouseenter: onMouseEnter,
  'click touchstart': onClick2,
});
```

_To remove listener:_
```javascript
// remove a listener
removeListener(el, 'click', 'myListener');

// remove a listener using name as type suffix
removeListener(el, 'click.myListener');

// remove all listeners added to an event type
removeListener(el, 'mouseenter');

// remove a listener without name
removeListener(el, 'click', onClick);
removeListener(el, 'mouseenter', onMouseEnter, {capture: true});

// remove multiple listeners
// with space-separated types
removeListener(el, 'click blur', 'myListener');
removeListener(el, 'mouseenter mouseleave', onMouseEnter, true);

// with array
removeListener(el, [
  ['click', 'myListener'],
  ['blur.myListener'], 
  ['click touchstart', onClick],
  ['mouseenter', onMouseEnter, {capture: true}],
  'focus',  // synonym of ['focus']
]);

// with object
// (note: listeners for capture phase without name are not supprted)
removeListener(el, {
  click: 'myListener',
  'blur.myListener': null,  // value is ignored if type has suffix
  'mouseenter mouseleave': onMousEnter,
  focus: undefined,  // falsy values are treated as removal of all listeners
});
```

## API

**addListener(target, type, listener[, options][, name]])**  
**addListener(target, listeners)**

Adds one or multiple event listeners to an event target and returns the result.

The first form is to add a single event listener to one or multiple event types. (single mode)

User can name the listener by providing it as the `name` argument or the suffix of event type. Listener name as type suffix has higher priority than the `name` argument. If both are provided, the function uses the suffix for the listener name. When adding listener to multiple types, listener name as the argument is applied to all types, but name as type suffix has to be added to each type.  

The scope of listener name is event type of a target. You can use the same name for different types or different targets, but cannot add different listeners to the same event type of a target using the same name.  

The function has protection to prevent a listener from being added repeatedly to the same target. You can add a listener only once per phase (bubble or capture) of an event type of an event target.  

The second form is to add multiple listeners. (multi mode) `listeners` can be either an array or an object.  
When using object, listener names need to be provided as type suffix and listeners for capture phase cannot be added.

*Parameters:*

- **target** _[EventTarget]_  
  Event target to add listener

- **type** _[String]_  
  One or more space-separated event types to listen for  
  Each type can have a suffix used for listener name.

- **listener** _[Function]_  
  Event listener function

- **options** _[Object|Boolean]_ _(optional)_  
  Option value(s) used for the `options`/`useCapture` argument of [`addEventListener()`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) call

- **name** _[String]_ _(optional)_  
  Name for the listener. Must be unique within the same event type of a target  
  When `type` has suffix, this value is overridden by it. 

- **listeners** _[Array|Object]_  
  – Array of parameters for each listener  
  **[** **[** type **,** listener _[_, options _]_ _[_, name _]_ **] , ... ]**  
  – Object in which the keys are types and the values are listener functions  
  **{** type **:** listener **, ... }**  

*Return value:*

- _[Boolean|Array|Object]_  
  - _Single mode:_  
    Boolean value that represents whether the listener is added successfully. For multiple types, array of each type's result.  
  - _Multi mode with array:_  
    Array of each of passed listener parameters' result
  - _Multi mode with object:_  
    Object of the type–result pairs of passed event types  

     
**removeListener(target, type[, listener[, options]])**  
**removeListener(target, listeners)**

Remove one or multiple event listeners from a event target.

The first form is to remove a single event listener (single mode) or to remove all event listeners (bulk mode) from one or multiple event types

User can specify the listener to remove using the listener name by providing it as the `listener` argument or the suffix of event type. Listener name as type suffix has higher priority than the `listener` argument. If both are provided, the function uses the suffix for the listener name. When adding listener to multiple types, listener name as the argument is applied to all types, but name as type suffix has to be added to each type.  
User can also specify the listener by passing the listener function and the options used to add to the corresponding arguments. The options doesn't have to be the same but whether it's for capture phase needs to match.

If the listener to remove is not specified, the function removes all listeners added to the event type(s).

The second form is to remove multiple listeners. (multi mode) `listeners` can be either an array or an object.  
When using object, unnamed listeners for capture phase cannot be removed. If a falsy value is set to the object's value, it is considered as bulk remove. And if type has suffix, the object's value is ignored. 

*Parameters:*

- **target** _[EventTarget]_  
  Event target to remove listener

- **type** _[String]_  
  One or more space-separated event type listening for  
  Each type can have a suffix used for listener name.

- **listener** _[Function|String]_ _(optional)_  
  Event listener function or the listener name used to add the listener  
  When this parameter is omitted, the function removes all listeners added to the event type of the target. And when `type` has suffix, this parameter is ignored.

- **options** _[Object|Boolean]_ _(optional)_  
  Option value(s) used for the `options`/`useCapture` argument of [`removeEventListener()`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener) call  
  When a string is passed to `listener`, this parameter is ignored.

- **listeners** _[Array|Object]_  
  – Array of parameters for each listener or types to remove all listeners  
  **[** **[** type _[_, listener _[_, options _]_ _]_ **]** _|_ type **, ... ]**  
  – Object in which the keys are types and the values are listener names, listener functions or any falsy values  
  **{** type **:** listener **, ... }**  


## License

- [MIT](./LICENSE)

