const listenerRegistries = new WeakMap();

function parseType(type, name) {
  const sep = type.indexOf('.');
  return sep < 0
    ? [type, typeof name === 'string' ? name : undefined]
    : [type.slice(0, sep), type.slice(sep + 1)];
}

function getCaptureVal(opts) {
  return !!(typeof opts === 'object' ? opts.capture : opts);
}

function examineListener(listener, criteria = {}) {
  if (criteria.name && criteria.name !== listener.name) {
    return false;
  }
  if (criteria.type && criteria.type !== listener.type) {
    return false;
  }
  if (criteria.fn && criteria.fn !== listener.fn) {
    return false;
  }
  if (
    criteria.capture !== undefined
    && criteria.capture !== getCaptureVal(listener.options)
  ) {
    return false;
  }
  return true;
}

function register(listeners, target, typeString, rawParams) {
  const params = typeof rawParams[1] === 'string' && rawParams[2] === undefined
    ? [rawParams[0], undefined, rawParams[1]]
    : rawParams;

  const [type, name] = parseType(typeString, params[2]);
  const [fn, options] = params;

  target.addEventListener(type, fn, options);
  return [...listeners, {type, fn, options, name}];
}

function unregister(listeners, target, typeString, params = undefined) {
  let criteria;
  if (params) {
    const [type, name] = parseType(typeString, params[0]);
    const fn = typeof params[0] === 'function' ? params[0] : undefined;
    const capture = fn && !name ? getCaptureVal(params[1]) : undefined;
    criteria = {name, type, fn, capture};
  }

  return listeners.reduce((result, listener) => {
    if (!criteria || examineListener(listener, criteria)) {
      target.removeEventListener(listener.type, listener.fn, listener.options);
    } else {
      result.push(listener);
    }
    return result;
  }, []);
}

function performAdd(listeners, target, entry) {
  const types = entry[0].split(' ');
  const params = entry.slice(1);
  return types.length > 1
    ? types.reduce((result, typeStr) => register(result, target, typeStr, params), listeners)
    : register(listeners, target, types[0], params);
}

function performRemove(listeners, target, entry) {
  const params = entry.slice(1);
  return entry[0]
    .split(' ')
    .reduce((result, typeStr) => unregister(result, target, typeStr, params), listeners);
}

/**
 * Add one or multiple event listener(s) to an event target
 * @param  {EventTarget} target - event target to add the listener
 * @param  {String|Array|Object} type - one or more space-separated event types
 * or array/object of the parameters for multiple listener addition
 * If a type has a suffix, it is used as the listener name.
 * @param  {Function} [listener] - evnet listener
 * @param  {Object|Boolean} [options] - options to be passed to addEventListener()
 * @param  {String} [name] - reference name of the listener
 * If suffixed types are in `type`, each suffix overrides this parameter.
 */
export function addListener(target, type, listener, options = undefined, name = undefined) {
  let listeners = listenerRegistries.get(target) || [];
  if (typeof type === 'string') {
    listeners = performAdd(listeners, target, [type, listener, options, name]);
  } else if (Array.isArray(type)) {
    listeners = type.reduce((result, entry) => performAdd(result, target, entry), listeners);
  } else {
    listeners = Object.entries(type)
      .reduce((result, entry) => performAdd(result, target, entry), listeners);
  }
  listenerRegistries.set(target, listeners);
}

/**
 * Remove one or multiple event listener(s) or all listeners for a event type
 * from an event target
 * @param  {EventTarget} target - event target to remove the listener
 * @param  {String|Array|Object} [type] - one or more space-separated event types
 * or array/object of the parameters for multiple listener removal
 * If a type has a suffix, it is used as the listener name and a type starting
 * with "." is trated as empty type + suffix.
 * If an empty type is given, the function ignores type when retriveng listeners.
 * If this parameter is omitted, the function removes all listeners added to the
 * target.
 * @param  {Function|String} [listener] - listener function or name of listener
 * If this parameter is omitted, the function removes all listeners listening for
 * the event type.
 * If a listener name is passed and suffixed types are in `type`, each suffix
 * overrides this parameter.
 * @param  {Object|Boolean} [options] - options to be passed to removeEventListener()
 * This parameter is ignored when listener name is specfied by `listener` or type
 * suffix
 */
export function removeListener(target, type = undefined, listener = undefined, options = undefined) {
  let listeners = listenerRegistries.get(target);
  if (!listeners) {
    return;
  }
  if (type === undefined) {
    listeners = unregister(listeners, target);
  } else if (typeof type === 'string') {
    listeners = performRemove(listeners, target, [type, listener, options]);
  } else if (Array.isArray(type)) {
    listeners = type.reduce((result, entry) => {
      return performRemove(result, target, Array.isArray(entry) ? entry : [entry]);
    }, listeners);
  } else {
    listeners = Object.entries(type)
      .reduce((result, entry) => performRemove(result, target, entry), listeners);
  }
  listenerRegistries.set(target, listeners);
}

/**
 * Returns event listeners added to an event target
 * @param  {EventTarget} target - event target to retrieve the listeners
 * @param  {Object} [criteria] - criteria to filter the result
 * The available options are:
 * - name {Strig} - reference name of the listener
 * - type {String} - type of event
 * - fn {Function} - evnet listener
 * - capture {Booliean} - whether to search for the listeners for capture phase
 * @return {Array} listener registration objects whose properties are:
 * - name {Strig} - reference name of the listener
 * - type {String} - type of event
 * - fn {Function} - evnet listener
 * - options {Object|Booliean} - options passed to addEventListener()
 */
export function getListeners(target, criteria = {}) {
  const listeners = listenerRegistries.get(target);
  if (!listeners) {
    return [];
  }
  return listeners.filter(listener => examineListener(listener, criteria));
}
