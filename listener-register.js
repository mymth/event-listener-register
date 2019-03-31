const listenerRegistries = new WeakMap();

function parseType(type, name) {
  const sep = type.indexOf('.');
  return sep < 0
    ? [type, (name && typeof name === 'string' ? name : undefined)]
    : [type.slice(0, sep), type.slice(sep + 1)];
}

function getCaptureVal(opts) {
  return !!(typeof opts === 'object' ? opts.capture : opts);
}

class Register {
  constructor(target) {
    this.target = target;
    this.registry = listenerRegistries.get(target);
  }

  prepare() {
    if (!this.registry) {
      this.registry = {};
      listenerRegistries.set(this.target, this.registry);
    }
    return this;
  }

  add(typeString, params) {
    const noOpts = typeof params[1] === 'string' && params[2] === undefined;
    const [type, name] = parseType(typeString, noOpts ? params[1] : params[2]);
    let listeners = this.registry[type];
    if (listeners) {
      if (name && name in listeners.byName) {
        return false;
      }
    } else {
      listeners = this.registry[type] = {
        forBubble: new Set(),
        forCapture: new Set(),
        byName: {},
      };
    }

    const listenerFn = params[0];
    const options = noOpts ? undefined : params[1];
    const capture = getCaptureVal(options);

    const doAdd = (listenerSet) => {
      if (listenerSet.has(listenerFn)) {
        return false;
      }
      this.target.addEventListener(type, listenerFn, options);
      listenerSet.add(listenerFn);
      if (name) {
        listeners.byName[name] = {fn: listenerFn, capture};
      }
      return true;
    }
    return doAdd(capture ? listeners.forCapture : listeners.forBubble);
  }

  remove(typeString, params) {
    const [type, name] = parseType(typeString, params[0]);
    const listeners = this.registry[type];
    if (!listeners) {
      return;
    }

    let listener;
    if (name) {
      if (!listeners.byName[name]) {
        return;
      }
      listener = Object.assign({name}, listeners.byName[name]);
    } else if (params[0]) {
      listener = {fn: params[0], capture: getCaptureVal(params[1])};
      // look for the name of the passed listener
      listener.name = Object.keys(listeners.byName).find((key) => {
        const entry = listeners.byName[key];
        return entry.fn === listener.fn && entry.capture === listener.capture;
      });
    } else {
      // remove all if the listener is not specified (neither by name nor by function)
      if (!(listeners.forBubble.size + listeners.forCapture.size)) {
        return;
      }
      listeners.forBubble.forEach((fn) => {
        this.target.removeEventListener(type, fn, false);
      });
      listeners.forCapture.forEach((fn) => {
        this.target.removeEventListener(type, fn, true);
      });
      listeners.forBubble.clear();
      listeners.forCapture.clear();
      listeners.byName = {};
      return;
    }

    const doRemove = (listenerSet) => {
      if (!listenerSet.has(listener.fn)) {
        return;
      }
      this.target.removeEventListener(type, listener.fn, listener.capture);
      listenerSet.delete(listener.fn);
      if (listener.name) {
        delete listeners.byName[listener.name];
      }
    };
    doRemove(listener.capture ? listeners.forCapture : listeners.forBubble);
  }
}

/**
 * Add one or multiple event listener(s) to an event target
 * - To add a single listener:
 *   Pass type, listener, options and name as individual arguements.
 *   ```
 *   addListener(element, 'keydown', onKeydown);
 *   addListener(element, 'click touchstart', onClick, 'myListener');
 *   addListener(element, 'mouseenter.myListener', onMounseEnter, {capture: true});
 *   ```
 * - to add multiple listeners:
 *   - to the 2nd argument, pass an array whose items are array of the values
 *     that correnpond to 2nd-5th arguments
 *     ```
 *     addListener(element, [
 *       ['keydown', onKeydown],
 *       ['click touchstart', onClick, 'myListener'],
 *       ['mouseenter.myListener', onMounseEnter, {capture: true}]
 *     ]);
 *     ```
 *     or an object of which the keys are types and the values are listeners.
 *     ```
 *     addListener(element, {
 *       keydown: onKeydown,
 *       'click touchstart': onClick,
 *       'mouseenter.myListener': onMouseEnter,
 *     });
 *     ```
 * @param  {EventTarget} target - event target to add the listener
 * @param  {String|Array|Object} type - type of event or space-separated event
 * types, or the parameters for multiple listeners to add
 * If a suffix is added to a type, it is used as name of the listener.
 * @param  {Function} [listener] - evnet listener
 * @param  {Object|Boolean} [options] - options to be passed to addEventListener()
 * @param  {String} [name] - reference name of the listener
 * Name must be unique per event type of a target. If suffixed types aare passed
 * to `type`, each suffix overrides this parameter.
 * @return {Boolean|Array} For single mode, whether the listener is added, for
 * multi mode, a list of types added successfully
 */
export function addListener(target, type, listener, options = undefined, name = undefined) {
  const register = new Register(target).prepare();
  const performAdd = (entry) => {
    const types = entry[0].split(' ');
    const params = entry.slice(1);
    return types.length > 1
      ? types.map(typeString => register.add(typeString, params))
      : register.add(types[0], params);
  };

  if (typeof type === 'string') {
    return performAdd([type, listener, options, name]);
  }
  if (Array.isArray(type)) {
    return type.map(performAdd);
  }
  return Object.entries(type).reduce((result, entry) => {
    result[entry[0]] = performAdd(entry);
    return result;
  }, {});
}

/**
 * Remove one or multiple event listener(s) or all listeners for a event type
 * from an event target
 * - To remove a single listener:
 *   Pass type, listener and options as individual arguements.
 *   ```
 *   removeListener(element, 'keydown', onKeydown);
 *   removeListener(element, 'click touchstart', 'myListener');
 *   removeListener(element, 'mouseenter.myListener', onMounseEnter, {capture: true});
 *   ```
 * - To remove all listeners of type(s):
 *   omit listener and options
 *   ````
 *   removeListener(element, 'keydown');
 *   removeListener(element, 'click touchstart');
 *   ````
 * - to remove multiple listeners:
 *   - to the 2nd argument, pass an array whose items are array of the values
 *     that correnpond to 2nd-4th arguments
 *     ```
 *     removeListener(element, [
 *       ['keydown', onKeydown],
 *       ['click touchstart', 'myListener'],
 *       ['mouseenter.myListener', onMounseEnter, {capture: true}],
 *       ['mousedown mouseup'],
 *     ]);
 *     ```
 *     or an object of which the keys are types and the values are listeners.
 *     ```
 *     removeListener(element, {
 *       keydown: onKeydown,
 *       'click touchstart': onClick,
 *       'mouseenter.myListener': onMouseEnter,
 *       'mousedown mouseup': null,
 *     });
 *     ```
 * @param  {EventTarget} target - event target to remove the listener
 * @param  {String|Array|Object} type - type of event or space-separated event
 * types, or the parameters for multiple listeners to remove
 * If a suffix is added to a type, it is used as name of listener.
 * @param  {Function|String} [listener] - listener function or name of listener
 * If this parameter is omitted, the function removes all listeners added for
 * the event type.
 * If name of listener is passed here and suffixed types aare passed to `type`,
 * each suffix overrides this parameter.
 * @param  {Object|Boolean} [options] - options to be passed to removeEventListener()
 * This parameter is ignored if name of listener is passed to `listener`
 */
export function removeListener(target, type, listener = undefined, options = undefined) {
  const register = new Register(target);
  if (!register.registry) {
    return;
  }

  const performRemove = (entry) => {
    const params = entry.slice(1);
    entry[0].split(' ').forEach(typeString => register.remove(typeString, params))
  };
  if (typeof type === 'string') {
    performRemove([type, listener, options]);
  } else if (Array.isArray(type)) {
    type.forEach((entry) => {
      performRemove(Array.isArray(entry) ? entry : [entry]);
    });
  } else {
    Object.entries(type).forEach(performRemove);
  }
}
