describe('getListeners()', function () {
  let target;

  beforeEach(function () {
    target = document.createElement('input');
    testContainer.appendChild(target);
  });

  afterEach(function () {
    testContainer.removeChild(target);
    listenerRegistries.delete(target);
  });

  const onClick = function onClick() {};
  const onClick2 = function onClick2() {};
  const onTouchStart = function onTouchStart() {};
  const onFocus = function onFocus() {};
  const onFocus2 = function onFocus2() {};
  const onBlur = function onBlur() {};
  const onKeydown = function onKeydown() {};
  const prepareListerners = () => {
    listenerRegistries.set(target, [
      {name: undefined, type: 'click', fn: onClick, options: undefined},
      {name: undefined, type: 'click', fn: onClick2, options: false},
      {name: undefined, type: 'touchstart', fn: onFocus2, options: false},
      {name: 'bar', type: 'touchstart', fn: onKeydown, options: false},
      {name: 'baz', type: 'touchstart', fn: onTouchStart, options: false},
      {name: undefined, type: 'focus', fn: onFocus, options: {capture: true}},
      {name: undefined, type: 'focus', fn: onFocus2, options: false},
      {name: 'foo', type: 'blur', fn: onBlur, options: {capture: false}},
      {name: 'foo', type: 'keydown', fn: onKeydown, options: false},
      {name: 'bar', type: 'keydown', fn: onKeydown, options: true},
    ]);
  }

  it('returns an empty array if no listener is added to the target', function () {
    expect(getListeners(target), 'to equal', []);
  });

  it('returns all listeners added to the target if no criteria is given', function () {
    prepareListerners();
    expect(getListeners(target), 'to equal', listenerRegistries.get(target));
  });

  it('returns listeners matching given name, type, fn, capture if they are set in criteria ', function () {
    prepareListerners();

    expect(getListeners(target, {name: 'foo'}), 'to equal', [
      {name: 'foo', type: 'blur', fn: onBlur, options: {capture: false}},
      {name: 'foo', type: 'keydown', fn: onKeydown, options: false},
    ]);
    expect(getListeners(target, {type: 'touchstart'}), 'to equal', [
      {name: undefined, type: 'touchstart', fn: onFocus2, options: false},
      {name: 'bar', type: 'touchstart', fn: onKeydown, options: false},
      {name: 'baz', type: 'touchstart', fn: onTouchStart, options: false},
    ]);
    expect(getListeners(target, {fn: onFocus2}), 'to equal', [
      {name: undefined, type: 'touchstart', fn: onFocus2, options: false},
      {name: undefined, type: 'focus', fn: onFocus2, options: false},
    ]);
    expect(getListeners(target, {capture: true}), 'to equal', [
      {name: undefined, type: 'focus', fn: onFocus, options: {capture: true}},
      {name: 'bar', type: 'keydown', fn: onKeydown, options: true},
    ]);
    //
    expect(getListeners(target, {type: 'focus', fn: onFocus2}), 'to equal', [
      {name: undefined, type: 'focus', fn: onFocus2, options: false},
    ]);
    expect(getListeners(target, {type: 'keydown', capture: false}), 'to equal', [
      {name: 'foo', type: 'keydown', fn: onKeydown, options: false},
    ]);
    expect(getListeners(target, {name: 'foo', type: 'blur'}), 'to equal', [
      {name: 'foo', type: 'blur', fn: onBlur, options: {capture: false}},
    ]);
  })
});