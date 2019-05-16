describe('addListener()', function () {
  let target;
  let spyAEL;

  beforeEach(function () {
    target = document.createElement('input');
    testContainer.appendChild(target);
    spyAEL = sinon.spy(target, 'addEventListener');
  });

  afterEach(function () {
    spyAEL.restore();
    testContainer.removeChild(target);
    listenerRegistries.delete(target);
  });

  it('adds a event listener to a target', function () {
    const onClick = sinon.spy();
    const onFocus = sinon.spy();
    const onBlur = sinon.spy();
    const opts = {capture: true};

    addListener(target, 'click', onClick, true);
    expect(spyAEL.calledWith('click', onClick, true), 'to be true');
    expect(listenerRegistries.get(target), 'to equal', [
      {name: undefined, type: 'click', fn: onClick, options: true},
    ]);

    spyAEL.resetHistory();

    addListener(target, 'focus', onFocus, opts);
    expect(spyAEL.calledWith('focus', onFocus, opts), 'to be true');
    expect(listenerRegistries.get(target), 'to equal', [
      {name: undefined, type: 'click', fn: onClick, options: true},
      {name: undefined, type: 'focus', fn: onFocus, options: opts},
    ]);

    spyAEL.resetHistory();

    addListener(target, 'blur', onBlur);
    expect(spyAEL.calledWith('blur', onBlur), 'to be true');
    expect(listenerRegistries.get(target), 'to equal', [
      {name: undefined, type: 'click', fn: onClick, options: true},
      {name: undefined, type: 'focus', fn: onFocus, options: opts},
      {name: undefined, type: 'blur', fn: onBlur, options: undefined},
    ]);

    const onClick2 = sinon.spy();

    addListener(target, 'click', onClick2);
    expect(listenerRegistries.get(target), 'to equal', [
      {name: undefined, type: 'click', fn: onClick, options: true},
      {name: undefined, type: 'focus', fn: onFocus, options: opts},
      {name: undefined, type: 'blur', fn: onBlur, options: undefined},
      {name: undefined, type: 'click', fn: onClick2, options: undefined},
    ]);

    testContainer.style.display = 'block';
    target.click();
    expect(onClick.called, 'to be true');
    expect(onClick2.calledAfter(onClick), 'to be true');
    expect(onFocus.called, 'to be false');
    expect(onBlur.called, 'to be false');
    target.focus();
    expect(onClick.callCount, 'to be', 1);
    expect(onClick2.callCount, 'to be', 1);
    expect(onFocus.called, 'to be true');
    expect(onBlur.called, 'to be false');
    target.blur();
    expect(onClick.callCount, 'to be', 1);
    expect(onClick2.callCount, 'to be', 1);
    expect(onFocus.callCount, 'to be', 1);
    expect(onBlur.called, 'to be true');
    testContainer.style.display = '';

    target.removeEventListener('click', onClick, true);
    target.removeEventListener('focus', onFocus, true);
    target.removeEventListener('blur', onBlur);
    target.removeEventListener('click', onClick2);
  });

  it('registers event listener with reference name if it is given', function () {
    const onClick = function onClick() {};
    const onClick2 = function onClick2() {};
    const onFocus = function onFocus() {};
    const onFocus2 = function onFocus2() {};

    addListener(target, 'click', onClick, true, 'foo');
    expect(listenerRegistries.get(target), 'to equal', [
      {name: 'foo', type: 'click', fn: onClick, options: true},
    ]);

    addListener(target, 'focus', onFocus, {capture: true}, 'bar');
    expect(listenerRegistries.get(target), 'to equal', [
      {name: 'foo', type: 'click', fn: onClick, options: true},
      {name: 'bar', type: 'focus', fn: onFocus, options: {capture: true}},
    ]);

    addListener(target, 'click', onClick2, 'baz');
    expect(listenerRegistries.get(target), 'to equal', [
      {name: 'foo', type: 'click', fn: onClick, options: true},
      {name: 'bar', type: 'focus', fn: onFocus, options: {capture: true}},
      {name: 'baz', type: 'click', fn: onClick2, options: undefined},
    ]);

    // same name can be used for different types
    addListener(target, 'focus', onFocus2, 'foo');
    expect(listenerRegistries.get(target), 'to equal', [
      {name: 'foo', type: 'click', fn: onClick, options: true},
      {name: 'bar', type: 'focus', fn: onFocus, options: {capture: true}},
      {name: 'baz', type: 'click', fn: onClick2, options: undefined},
      {name: 'foo', type: 'focus', fn: onFocus2, options: undefined},
    ]);

    target.removeEventListener('click', onClick, true);
    target.removeEventListener('focus', onFocus, true);
    target.removeEventListener('click', onClick2);
    target.removeEventListener('focus', onFocus2);
  });

  it('takes the suffix in type as name and overrides name argument with it', function () {
    const onClick = function onClick() {};
    const onClick2 = function onClick2() {};
    const onFocus = function onFocus() {};
    const onFocus2 = function onFocus2() {};

    addListener(target, 'click.foo', onClick, true);
    expect(listenerRegistries.get(target), 'to equal', [
      {name: 'foo', type: 'click', fn: onClick, options: true},
    ]);

    addListener(target, 'click', onClick2, 'bar');
    expect(listenerRegistries.get(target), 'to equal', [
      {name: 'foo', type: 'click', fn: onClick, options: true},
      {name: 'bar', type: 'click', fn: onClick2, options: undefined},
    ]);

    addListener(target, 'focus.foo', onFocus);
    expect(listenerRegistries.get(target), 'to equal', [
      {name: 'foo', type: 'click', fn: onClick, options: true},
      {name: 'bar', type: 'click', fn: onClick2, options: undefined},
      {name: 'foo', type: 'focus', fn: onFocus, options: undefined},
    ]);

    addListener(target, 'focus.baz', onFocus2, 'bar');
    expect(listenerRegistries.get(target), 'to equal', [
      {name: 'foo', type: 'click', fn: onClick, options: true},
      {name: 'bar', type: 'click', fn: onClick2, options: undefined},
      {name: 'foo', type: 'focus', fn: onFocus, options: undefined},
      {name: 'baz', type: 'focus', fn: onFocus2, options: undefined},
    ]);

    target.removeEventListener('click', onClick, true);
    target.removeEventListener('click', onClick2);
    target.removeEventListener('focus', onFocus);
    target.removeEventListener('focus', onFocus2);
  })

  it('accepts duplicate entries', function () {
    const onClick = function onClick() {};
    const onClick2 = function onClick2() {};
    //
    listenerRegistries.set(target, [
      {name: undefined, type: 'click', fn: onClick, options: false},
      {name: 'foo', type: 'click', fn: onClick2, options: true},
    ]);

    expect(addListener(target, 'click', onClick), 'to be undefined');
    expect(spyAEL.called, 'to be true');

    addListener(target, 'click', onClick, false, 'foo');
    expect(spyAEL.called, 'to be true');

    expect(listenerRegistries.get(target), 'to equal', [
      {name: undefined, type: 'click', fn: onClick, options: false},
      {name: 'foo', type: 'click', fn: onClick2, options: true},
      {name: undefined, type: 'click', fn: onClick, options: undefined},
      {name: 'foo', type: 'click', fn: onClick, options: false},
    ]);

    target.removeEventListener('click', onClick);
  });

  it('adds a listener to multiple types if type is space-separated', function () {
    const onClick = function onClick() {};
    const onKeydown = function onKeydown() {};
    const onBlur = function onBlur() {};

    addListener(target, 'click focus', onClick, 'foo');
    expect(spyAEL.calledTwice, 'to be true');
    expect(spyAEL.args, 'to equal', [
      ['click', onClick, undefined],
      ['focus', onClick, undefined],
    ]);
    expect(listenerRegistries.get(target), 'to equal', [
      {name: 'foo', type: 'click', fn: onClick, options: undefined},
      {name: 'foo', type: 'focus', fn: onClick, options: undefined},
    ]);

    spyAEL.resetHistory();

    addListener(target, 'keydown click', onKeydown, true, 'foo');
    expect(spyAEL.calledTwice, 'to be true');
    expect(spyAEL.args, 'to equal', [
      ['keydown', onKeydown, true],
      ['click', onKeydown, true],
    ]);
    expect(listenerRegistries.get(target), 'to equal', [
      {name: 'foo', type: 'click', fn: onClick, options: undefined},
      {name: 'foo', type: 'focus', fn: onClick, options: undefined},
      {name: 'foo', type: 'keydown', fn: onKeydown, options: true},
      {name: 'foo', type: 'click', fn: onKeydown, options: true},
    ]);

    spyAEL.resetHistory();

    // for click, 'bar' is used for the name (type suffix > name argument)
    addListener(target, 'blur click.bar', onBlur, 'foo');
    expect(listenerRegistries.get(target), 'to equal', [
      {name: 'foo', type: 'click', fn: onClick, options: undefined},
      {name: 'foo', type: 'focus', fn: onClick, options: undefined},
      {name: 'foo', type: 'keydown', fn: onKeydown, options: true},
      {name: 'foo', type: 'click', fn: onKeydown, options: true},
      {name: 'foo', type: 'blur', fn: onBlur, options: undefined},
      {name: 'bar', type: 'click', fn: onBlur, options: undefined},
    ]);

    target.removeEventListener('click', onClick);
    target.removeEventListener('focus', onClick);
    target.removeEventListener('keydown', onKeydown, true);
    target.removeEventListener('blur', onBlur);
  });

  it('adds multiple listeners in array to a target', function () {
    const onClick = function onClick() {};
    const onClick2 = function onClick2() {};
    const onBlur = function onBlur() {};
    const onKeydown = function onKeydown() {};
    const onFocus = function onFocus() {};
    const onFocus2 = function onFocus2() {};
    const onClickOpts = {capture: true};

    addListener(target, [
      ['click', onClick, onClickOpts],
      ['blur', onBlur, true, 'foo'],
      ['keydown', onKeydown],
    ]);
    expect(spyAEL.calledThrice, 'to be true');
    expect(spyAEL.args, 'to equal', [
      ['click', onClick, onClickOpts],
      ['blur', onBlur, true],
      ['keydown', onKeydown, undefined],
    ]);
    expect(listenerRegistries.get(target), 'to equal', [
      {name: undefined, type: 'click', fn: onClick, options: onClickOpts},
      {name: 'foo', type: 'blur', fn: onBlur, options: true},
      {name: undefined, type: 'keydown', fn: onKeydown, options: undefined},
    ]);

    spyAEL.resetHistory();

    addListener(target, [
      ['blur', onBlur, 'foo'],
      ['click', onClick],
      ['keydown', onKeydown],
    ]);
    expect(spyAEL.callCount, 'to be', 3);
    expect(spyAEL.args, 'to equal', [
      ['blur', onBlur, undefined],
      ['click', onClick, undefined],
      ['keydown', onKeydown, undefined],
    ]);
    expect(listenerRegistries.get(target), 'to equal', [
      {name: undefined, type: 'click', fn: onClick, options: onClickOpts},
      {name: 'foo', type: 'blur', fn: onBlur, options: true},
      {name: undefined, type: 'keydown', fn: onKeydown, options: undefined},
      {name: 'foo', type: 'blur', fn: onBlur, options: undefined},
      {name: undefined, type: 'click', fn: onClick, options: undefined},
      {name: undefined, type: 'keydown', fn: onKeydown, options: undefined},
    ]);

    spyAEL.resetHistory();

    addListener(target, [
      ['click keydown', onClick2],
      ['click focus', onFocus, 'foo'],
      ['click focus.bar', onFocus2, {capture: true}, 'foo'],
    ]);
    expect(spyAEL.callCount, 'to be', 6);
    expect(spyAEL.args, 'to equal', [
      ['click', onClick2, undefined],
      ['keydown', onClick2, undefined],
      ['click', onFocus, undefined],
      ['focus', onFocus, undefined],
      ['click', onFocus2, {capture: true}],
      ['focus', onFocus2, {capture: true}],
    ]);
    expect(listenerRegistries.get(target), 'to equal', [
      {name: undefined, type: 'click', fn: onClick, options: onClickOpts},
      {name: 'foo', type: 'blur', fn: onBlur, options: true},
      {name: undefined, type: 'keydown', fn: onKeydown, options: undefined},
      {name: 'foo', type: 'blur', fn: onBlur, options: undefined},
      {name: undefined, type: 'click', fn: onClick, options: undefined},
      {name: undefined, type: 'keydown', fn: onKeydown, options: undefined},
      {name: undefined, type: 'click', fn: onClick2, options: undefined},
      {name: undefined, type: 'keydown', fn: onClick2, options: undefined},
      {name: 'foo', type: 'click', fn: onFocus, options: undefined},
      {name: 'foo', type: 'focus', fn: onFocus, options: undefined},
      {name: 'foo', type: 'click', fn: onFocus2, options: {capture: true}},
      {name: 'bar', type: 'focus', fn: onFocus2, options: {capture: true}},
    ]);

    target.removeEventListener('click', onClick);
    target.removeEventListener('click', onClick, true);
    target.removeEventListener('blur', onBlur);
    target.removeEventListener('blur', onBlur, true);
    target.removeEventListener('keydown', onKeydown);
    target.removeEventListener('click', onClick2);
    target.removeEventListener('keydown', onClick2);
    target.removeEventListener('click', onFocus);
    target.removeEventListener('focus', onFocus);
    target.removeEventListener('click', onFocus2, true);
    target.removeEventListener('focus', onFocus2, true);
  });

  it('adds multiple listeners in type:listener object and returns type:result object', function () {
    const onClick = function onClick() {};
    const onClick2 = function onClick2() {};
    const onBlur = function onBlur() {};
    const onKeydown = function onKeydown() {};
    const onFocus = function onFocus() {};
    const onFocus2 = function onFocus2() {};

    addListener(target, {
      click: onClick,
      blur: onBlur,
      keydown: onKeydown,
    });
    expect(spyAEL.calledThrice, 'to be true');
    expect(spyAEL.args, 'to equal', [
      ['click', onClick, undefined],
      ['blur', onBlur, undefined],
      ['keydown', onKeydown, undefined],
    ]);
    expect(listenerRegistries.get(target), 'to equal', [
      {name: undefined, type: 'click', fn: onClick, options: undefined},
      {name: undefined, type: 'blur', fn: onBlur, options: undefined},
      {name: undefined, type: 'keydown', fn: onKeydown, options: undefined},
    ]);

    spyAEL.resetHistory();

    addListener(target, {
      click: onClick2,
      keydown: onKeydown,
    });
    expect(spyAEL.callCount, 'to be', 2);
    expect(spyAEL.args, 'to equal', [
      ['click', onClick2, undefined],
      ['keydown', onKeydown, undefined],
    ]);
    expect(listenerRegistries.get(target), 'to equal', [
      {name: undefined, type: 'click', fn: onClick, options: undefined},
      {name: undefined, type: 'blur', fn: onBlur, options: undefined},
      {name: undefined, type: 'keydown', fn: onKeydown, options: undefined},
      {name: undefined, type: 'click', fn: onClick2, options: undefined},
      {name: undefined, type: 'keydown', fn: onKeydown, options: undefined},
    ]);

    spyAEL.resetHistory();

    addListener(target, {
      'click keydown': onClick2,
      'click.foo focus.foo': onFocus,
      'click.foo focus.bar': onFocus2,
    });
    expect(spyAEL.callCount, 'to be', 6);
    expect(spyAEL.args, 'to equal', [
      ['click', onClick2, undefined],
      ['keydown', onClick2, undefined],
      ['click', onFocus, undefined],
      ['focus', onFocus, undefined],
      ['click', onFocus2, undefined],
      ['focus', onFocus2, undefined],
    ]);
    expect(listenerRegistries.get(target), 'to equal', [
      {name: undefined, type: 'click', fn: onClick, options: undefined},
      {name: undefined, type: 'blur', fn: onBlur, options: undefined},
      {name: undefined, type: 'keydown', fn: onKeydown, options: undefined},
      {name: undefined, type: 'click', fn: onClick2, options: undefined},
      {name: undefined, type: 'keydown', fn: onKeydown, options: undefined},
      {name: undefined, type: 'click', fn: onClick2, options: undefined},
      {name: undefined, type: 'keydown', fn: onClick2, options: undefined},
      {name: 'foo', type: 'click', fn: onFocus, options: undefined},
      {name: 'foo', type: 'focus', fn: onFocus, options: undefined},
      {name: 'foo', type: 'click', fn: onFocus2, options: undefined},
      {name: 'bar', type: 'focus', fn: onFocus2, options: undefined},
    ]);

    target.removeEventListener('click', onClick);
    target.removeEventListener('click', onClick2);
    target.removeEventListener('blur', onBlur);
    target.removeEventListener('keydown', onKeydown);
    target.removeEventListener('keydown', onClick2);
    target.removeEventListener('click', onFocus);
    target.removeEventListener('focus', onFocus);
    target.removeEventListener('click', onFocus2);
    target.removeEventListener('focus', onFocus2);
  });
});
