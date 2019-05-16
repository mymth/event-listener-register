# Event Listener Register

Add event listeners with name and remove them by name in native JavaScript.

This module is intended for a support tool to rewrite jQuery dependent programs in native JavaScript.

The module provides wrapper functions for `EventTarget.addEventListener()` and `removeEventListener()` that allow users to manage event listeners by name and handle multiple listeners in a single call.

## Usage

For Node.js, install the package using npm

```sh
npm install --save event-listener-register
```

and import the functions.

```javascript
import { addListener, removeListener, getListeners } from 'event-listener-register/listener-register';

// or import as CommonJS module
const { addListener, removeListener, getListeners } = require('event-listener-register');
```

For browser, load the package from CDN and expose the functions.

```html
<script src="https://cdn.jsdelivr.net/npm/event-listener-register/dist/listener-register.min.js"></script>
<script>
  var { addListener, removeListener, getListeners } = listenerRegsiter;
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
// - listeners for capture phase are not supprted
addListener(el, {
  click: onClick,
  'blur.myListener': onBlur,
  mouseenter: onMouseEnter,
  'click touchstart': onClick2,
});
```

_To remove listener:_
```javascript
// remove all listeners
removeListener(el);

// remove all listeners added to an event type
removeListener(el, 'mouseenter');

// remove all listeners with a name (regardless of the type)
removeListener(el, '', 'myListener');
removeListener(el, '.myListener');

// remove a listener
removeListener(el, 'click', 'myListener');

// remove a listener using name as type suffix
removeListener(el, 'click.myListener');

// remove a listener without name
removeListener(el, 'click', onClick);
removeListener(el, 'mouseenter', onMouseEnter, {capture: true});

// remove multiple listeners
// with space-separated types/names
removeListener(el, 'click blur', 'myListener');
removeListener(el, 'mouseenter mouseleave', onMouseEnter, true);
removeListener(el, '.myListener .extraListener');

// with array
removeListener(el, [
  ['click', 'myListener'],
  ['blur.myListener'], 
  ['click touchstart', onClick],
  ['mouseenter', onMouseEnter, {capture: true}],
  'focus',  // synonym of ['focus']
  ['.myListener'],
]);

// with object
// - listeners for capture phase without name are not supprted
// - falsy values indicate removal of all listeners matching the types/names
removeListener(el, {
  click: 'myListener',
  'blur.myListener': null,
  'mouseenter mouseleave': onMousEnter,
  focus: undefined,
  '.myListener': false,
});
```

_To retrieve listeners:_
```javascript
// retrieve all listeners
getListeners(el);

// retrieve listeners with name
getListeners(el, {name: 'myListener'});

// retrieve listeners for a event type
getListeners(el, {type: 'click'});

// retrieve listeners with function
getListeners(el, {fn: onClick});
getListeners(el, {fn: onMousEnter, capture: true});

```

## API

**addListener(target, type, listener[, options][, name]])**  
**addListener(target, listeners)**

Adds one or multiple event listeners to an event target.

The first form is to add a single event listener to one or multiple event types.

Event listeners can be named by passing the name to the `name` argument or adding it to a event type as a suffix.  
While listener name as argument is applied to all event types in the `type` argument, the one as suffix is only applied to the type it is added. It also has higher priority than the one as argument.

The second form is to add multiple listeners. `listeners` can be either an array or an object.  
When using object, listener names have to be provided as type suffix and listeners for capture phase are not supproted.

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
  Name for the listener  
  When `type` has suffix, this value is overridden by it. 

- **listeners** _[Array|Object]_  
  – Array of parameters for each listener  
  **[** **[** type **,** listener _[_, options _]_ _[_, name _]_ **] , ... ]**  
  – Object in which the keys are types and the values are listener functions  
  **{** type **:** listener **, ... }**  

     
**removeListener(target[, type[, listener[, options]]])**  
**removeListener(target, listeners)**

Remove one or multiple event listeners from an event target.

The first form is to remove a single event listener, all event listeners or event listeners for certain event types or listener names.

The listener to remove can be specified by name or reference to the listener function. When a listener name is passed to the `listener` argument, the `options` argument is completely ignored. In contrast, omitting `options` works as a shorthand for specifying `{capture: false}` when passing a listener function.  

If the listener to remove is not specified, all event listeners listening for the specified event type(s) will be removed.

Removing event listeners across the types can be done by passing an empty string to the `type` argument. You can specify the listeners by name or by function in this case, too. To specifying listeners by name, you can also pass the listener name preceded by `.` to the `type` argument. (a type starting with `.` is treated as an empty type + suffix)

If neither types nor listeners are specified, all event listeners added to the event target will be removed.

The second form is to remove multiple listeners. `listeners` can be either an array or an object.  
When using object, listeners for capture phase without name are not supproted. And you can use any falsy value to omit specifying a listener name/function. 

*Parameters:*

- **target** _[EventTarget]_  
  Event target to remove listener

- **type** _[String]_ _(optional)_  
  One or more space-separated event type listening for  
  Each type can have a suffix used for listener name.  
  If the value is empty, the function retrieves the listeners to remove ignoring the type.  
  If a type starts with `.`, the function takes it as en empty type with suffix.  
  When this parameter is omitted, the function removes all listeners added to the target.

- **listener** _[Function|String]_ _(optional)_  
  Event listener function or the listener name used to add the listener  
  When a string is passed and `type` has suffix, this value is overridden by the suffix.  
  When this parameter is omitted, the function removes all listeners lietening for the event type.

- **options** _[Object|Boolean]_ _(optional)_  
  Option value(s) used for the `options`/`useCapture` argument of [`removeEventListener()`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener) call  
  When a string is passed to `listener`, this parameter is ignored.

- **listeners** _[Array|Object]_  
  – Array of parameters for each listener or types to remove all listeners  
  **[** **[** type _[_, listener _[_, options _]_ _]_ **]** _|_ type **, ... ]**  
  – Object in which the keys are types and the values are listener names or functions  
  **{** type **:** listener **, ... }**  

     
**getListeners(target[, criteria])**

Retrieve the event listeners added to an event target.

*Parameters:*

- **target** _[EventTarget]_  
  Event target to retrieve listeners

- **criteria** _[Object]_ _(optional)_  
  Criteria to narrow the result  
  Properties:  
  - `name` - _[String]_ - Listener name
  - `type` - _[String]_ - Event type
  - `fn` - _[Function]_ - Listener function
  - `capture` - _[Boolean]_ - Phase of event the search for the listeners to be made  
    If `true`, only listeners for capture phase are retrieved. If `false`, only listeners for bubble phase are retrieved.

*Return value:*

- _[Array]_  
  Registration objects (parameters used on `addListener()` call) of the event listeners that meet the criteria.  
  Properties:  
  - `name` - _[String]_ - Listener name
  - `type` - _[String]_ - Event type
  - `fn` - _[Function]_ - Listener function
  - `options` - _[Object|Boolean]_ - Value for `options`/`useCapture`

## License

- [MIT](./LICENSE)

