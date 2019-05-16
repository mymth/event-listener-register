describe('removeListener()', function () {
  let target;
  let spyREL;

  beforeEach(function () {
    target = document.createElement('input');
    testContainer.appendChild(target);
    spyREL = sinon.spy(target, 'removeEventListener');
  });

  afterEach(function () {
    spyREL.restore();
    testContainer.removeChild(target);
    listenerRegistries.delete(target);
  });

  it('removes a event listener from a target', function () {
    const onClick = sinon.spy();
    const onClick2 = sinon.spy();
    const onFocus = sinon.spy();
    const onBlur = sinon.spy();
    listenerRegistries.set(target, [
      {name: undefined, type: 'click', fn: onClick, options: undefined},
      {name: undefined, type: 'click', fn: onClick, options: true},
      {name: undefined, type: 'click', fn: onClick2, options: undefined},
      {name: undefined, type: 'focus', fn: onFocus, options: undefined},
      {name: undefined, type: 'blur', fn: onBlur, options: true},
    ]);
    target.addEventListener('click', onClick);
    target.addEventListener('click', onClick, true);
    target.addEventListener('click', onClick2);
    target.addEventListener('focus', onFocus);
    target.addEventListener('blur', onBlur, true);

    removeListener(target, 'click', onClick, {capture: true});
    expect(spyREL.calledWith('click', onClick, true), 'to be true');
    expect(listenerRegistries.get(target), 'to equal', [
      {name: undefined, type: 'click', fn: onClick, options: undefined},
      {name: undefined, type: 'click', fn: onClick2, options: undefined},
      {name: undefined, type: 'focus', fn: onFocus, options: undefined},
      {name: undefined, type: 'blur', fn: onBlur, options: true},
    ]);

    spyREL.resetHistory();

    removeListener(target, 'blur', onBlur, true);
    expect(spyREL.calledWith('blur', onBlur, true), 'to be true');
    expect(listenerRegistries.get(target), 'to equal', [
      {name: undefined, type: 'click', fn: onClick, options: undefined},
      {name: undefined, type: 'click', fn: onClick2, options: undefined},
      {name: undefined, type: 'focus', fn: onFocus, options: undefined},
    ]);

    spyREL.resetHistory();

    removeListener(target, 'click', onClick);
    expect(spyREL.calledWith('click', onClick), 'to be true');
    expect(listenerRegistries.get(target), 'to equal', [
      {name: undefined, type: 'click', fn: onClick2, options: undefined},
      {name: undefined, type: 'focus', fn: onFocus, options: undefined},
    ]);

    testContainer.style.display = 'block';
    target.click();
    expect(onClick.called, 'to be false');
    expect(onClick2.called, 'to be true');
    expect(onFocus.called, 'to be false');
    expect(onBlur.called, 'to be false');
    target.focus();
    expect(onClick.called, 'to be false');
    expect(onClick2.callCount, 'to be', 1);
    expect(onFocus.called, 'to be true');
    expect(onBlur.called, 'to be false');
    target.blur();
    expect(onClick.called, 'to be false');
    expect(onClick2.callCount, 'to be', 1);
    expect(onFocus.callCount, 'to be', 1);
    expect(onBlur.called, 'to be false');
    testContainer.style.display = '';

    target.removeEventListener('click', onClick2);
    target.removeEventListener('focus', onFocus);
  });

  it('removes a event listener by reference name', function () {
    const onClick = function onClick() {};
    const onClick2 = function onClick2() {};
    const onFocus = function onFocus() {};
    const onBlur = function onBlur() {};
    listenerRegistries.set(target, [
      {name: 'foo', type: 'click', fn: onClick, options: undefined},
      {name: undefined, type: 'click', fn: onClick2, options: undefined},
      {name: 'bar', type: 'click', fn: onClick, options: true},
      {name: 'baz', type: 'focus', fn: onFocus, options: undefined},
      {name: 'bam', type: 'blur', fn: onBlur, options: true},
    ]);

    removeListener(target, 'click', 'bar');
    expect(spyREL.calledWith('click', onClick, true), 'to be true');
    expect(listenerRegistries.get(target), 'to equal', [
      {name: 'foo', type: 'click', fn: onClick, options: undefined},
      {name: undefined, type: 'click', fn: onClick2, options: undefined},
      {name: 'baz', type: 'focus', fn: onFocus, options: undefined},
      {name: 'bam', type: 'blur', fn: onBlur, options: true},
    ]);

    spyREL.resetHistory();

    removeListener(target, 'blur', 'bam');
    expect(spyREL.calledWith('blur', onBlur, true), 'to be true');
    expect(listenerRegistries.get(target), 'to equal', [
      {name: 'foo', type: 'click', fn: onClick, options: undefined},
      {name: undefined, type: 'click', fn: onClick2, options: undefined},
      {name: 'baz', type: 'focus', fn: onFocus, options: undefined},
    ]);

    spyREL.resetHistory();

    removeListener(target, 'click', 'foo');
    expect(spyREL.calledWith('click', onClick), 'to be true');
    expect(listenerRegistries.get(target), 'to equal', [
      {name: undefined, type: 'click', fn: onClick2, options: undefined},
      {name: 'baz', type: 'focus', fn: onFocus, options: undefined},
    ]);
  });

  it('takes the suffix in type as name and overrides name argument with it', function () {
    const onClick = function onClick() {};
    const onClick2 = function onClick2() {};
    listenerRegistries.set(target, [
      {name: 'foo', type: 'click', fn: onClick, options: undefined},
      {name: undefined, type: 'click', fn: onClick2, options: undefined},
      {name: 'bar', type: 'click', fn: onClick, options: true},
    ]);

    removeListener(target, 'click.bar', 'foo');
    expect(spyREL.calledWith('click', onClick, true), 'to be true');
    expect(listenerRegistries.get(target), 'to equal', [
      {name: 'foo', type: 'click', fn: onClick, options: undefined},
      {name: undefined, type: 'click', fn: onClick2, options: undefined},
    ]);

    spyREL.resetHistory();

    removeListener(target, 'click.foo');
    expect(spyREL.calledWith('click', onClick), 'to be true');
    expect(listenerRegistries.get(target), 'to equal', [
      {name: undefined, type: 'click', fn: onClick2, options: undefined},
    ]);
  });

  it('removes named listener even if the function is passed', function () {
    const onClick = function onClick() {};
    // const click_0 = [onClick, true, 'foo'];
    listenerRegistries.set(target, [
      {name: 'foo', type: 'click', fn: onClick, options: true},
    ]);

    removeListener(target, 'click', onClick, true);
    expect(listenerRegistries.get(target), 'to equal', []);
  });

  it('removes all event listeners for a type from a target if listener is not specified', function () {
    const onClick = function onClick() {};
    const onClick2 = function onClick2() {};
    listenerRegistries.set(target, [
      {name: undefined, type: 'click', fn: onClick, options: false},
      {name: 'foo', type: 'click', fn: onClick2, options: undefined},
      {name: undefined, type: 'click', fn: onClick, options: true},
    ]);

    removeListener(target, 'click');
    expect(spyREL.calledThrice, 'to be true');
    expect(spyREL.args, 'to equal', [
      ['click', onClick, false],
      ['click', onClick2, undefined],
      ['click', onClick, true],
    ]);
    expect(listenerRegistries.get(target), 'to equal', []);
  });

  it('removes all event listeners for a name from a target if an empty type + no listener are specified', function () {
    const onClick = function onClick() {};
    const onClick2 = function onClick2() {};
    const onBlur = function onBlur() {};
    const onBlur2 = function onBlur2() {};
    listenerRegistries.set(target, [
      {name: 'foo', type: 'click', fn: onClick, options: false},
      {name: 'foo', type: 'blur', fn: onBlur, options: false},
      {name: 'bar', type: 'click', fn: onClick2, options: undefined},
      {name: 'bar', type: 'blur', fn: onBlur2, options: undefined},
      {name: 'baz', type: 'click', fn: onClick, options: true},
      {name: 'bam', type: 'blur', fn: onBlur, options: true},
    ]);

    removeListener(target, '', 'foo');
    expect(spyREL.calledTwice, 'to be true');
    expect(spyREL.args, 'to equal', [
      ['click', onClick, false],
      ['blur', onBlur, false],
    ]);
    expect(listenerRegistries.get(target), 'to equal', [
      {name: 'bar', type: 'click', fn: onClick2, options: undefined},
      {name: 'bar', type: 'blur', fn: onBlur2, options: undefined},
      {name: 'baz', type: 'click', fn: onClick, options: true},
      {name: 'bam', type: 'blur', fn: onBlur, options: true},
    ]);

    spyREL.resetHistory();

    removeListener(target, '.bar');
    expect(spyREL.calledTwice, 'to be true');
    expect(spyREL.args, 'to equal', [
      ['click', onClick2, undefined],
      ['blur', onBlur2, undefined],
    ]);
    expect(listenerRegistries.get(target), 'to equal', [
      {name: 'baz', type: 'click', fn: onClick, options: true},
      {name: 'bam', type: 'blur', fn: onBlur, options: true},
    ]);

    spyREL.resetHistory();

    removeListener(target, '.bam', 'baz');
    expect(spyREL.calledOnce, 'to be true');
    expect(spyREL.args, 'to equal', [
      ['blur', onBlur, true],
    ]);
    expect(listenerRegistries.get(target), 'to equal', [
      {name: 'baz', type: 'click', fn: onClick, options: true},
    ]);
  });

  it('remove a listener from multiple types if type is space-separated', function () {
    const onClick = function onClick() {};
    const onFocus = function onFocus() {};
    const onKeydown = function onKeydown() {};
    const onBlur = function onBlur() {};
    listenerRegistries.set(target, [
      {name: 'foo', type: 'click', fn: onClick, options: false},
      {name: 'bar', type: 'click', fn: onBlur, options: false},
      {name: undefined, type: 'click', fn: onFocus, options: true},
      {name: 'foo', type: 'focus', fn: onClick, options: undefined},
      {name: undefined, type: 'focus', fn: onFocus, options: true},
      {name: 'foo', type: 'keydown', fn: onKeydown, options: true},
      {name: 'foo', type: 'blur', fn: onBlur, options: false},
    ]);

    removeListener(target, 'click focus', onFocus, true);
    expect(spyREL.calledTwice, 'to be true');
    expect(spyREL.args, 'to equal', [
      ['click', onFocus, true],
      ['focus', onFocus, true],
    ]);
    expect(listenerRegistries.get(target), 'to equal', [
      {name: 'foo', type: 'click', fn: onClick, options: false},
      {name: 'bar', type: 'click', fn: onBlur, options: false},
      {name: 'foo', type: 'focus', fn: onClick, options: undefined},
      {name: 'foo', type: 'keydown', fn: onKeydown, options: true},
      {name: 'foo', type: 'blur', fn: onBlur, options: false},
    ]);

    spyREL.resetHistory();

    removeListener(target, 'keydown click', 'foo');
    expect(spyREL.calledTwice, 'to be true');
    expect(spyREL.args, 'to equal', [
      ['keydown', onKeydown, true],
      ['click', onClick, false],
    ]);
    expect(listenerRegistries.get(target), 'to equal', [
      {name: 'bar', type: 'click', fn: onBlur, options: false},
      {name: 'foo', type: 'focus', fn: onClick, options: undefined},
      {name: 'foo', type: 'blur', fn: onBlur, options: false},
    ]);

    spyREL.resetHistory();

    // for click, 'bar' is used for the name (type suffix > name argument)
    removeListener(target, 'blur click.bar', 'foo');
    expect(spyREL.args, 'to equal', [
      ['blur', onBlur, false],
      ['click', onBlur, false],
    ]);
    expect(listenerRegistries.get(target), 'to equal', [
      {name: 'foo', type: 'focus', fn: onClick, options: undefined},
    ]);
  });

  it('remove listeners from multiple names if type is space-separated and suffix-only', function () {
    const onClick = function onClick() {};
    const onFocus = function onFocus() {};
    const onKeydown = function onKeydown() {};
    const onBlur = function onBlur() {};
    listenerRegistries.set(target, [
      {name: 'foo', type: 'click', fn: onClick, options: false},
      {name: 'bar', type: 'click', fn: onBlur, options: false},
      {name: 'foo', type: 'focus', fn: onClick, options: undefined},
      {name: 'baz', type: 'focus', fn: onFocus, options: undefined},
      {name: 'foo', type: 'keydown', fn: onKeydown, options: true},
      {name: 'foo', type: 'blur', fn: onBlur, options: false},
    ]);

    removeListener(target, '.foo .bar', onBlur);
    expect(spyREL.calledTwice, 'to be true');
    expect(spyREL.args, 'to equal', [
      ['blur', onBlur, false],
      ['click', onBlur, false],
    ]);
    expect(listenerRegistries.get(target), 'to equal', [
      {name: 'foo', type: 'click', fn: onClick, options: false},
      {name: 'foo', type: 'focus', fn: onClick, options: undefined},
      {name: 'baz', type: 'focus', fn: onFocus, options: undefined},
      {name: 'foo', type: 'keydown', fn: onKeydown, options: true},
    ]);

    spyREL.resetHistory();

    removeListener(target, '.foo .baz');
    expect(spyREL.callCount, 'to be', 4);
    expect(spyREL.args, 'to equal', [
      ['click', onClick, false],
      ['focus', onClick, undefined],
      ['keydown', onKeydown, true],
      ['focus', onFocus, undefined],
    ]);
    expect(listenerRegistries.get(target), 'to equal', []);
  });

  it('removes multiple listeners in array from a target', function () {
    const onClick = function onClick() {};
    const onClick2 = function onClick2() {};
    const onTouchStart = function onTouchStart() {};
    const onFocus = function onFocus() {};
    const onFocus2 = function onFocus2() {};
    const onBlur = function onBlur() {};
    const onKeydown = function onKeydown() {};
    const onMouseEnter = function onMouseEnter() {};
    const onMouseEnter2 = function onMouseEnter2() {};
    const onMouseDown = function onMouseDown() {};
    const onMouseDown2 = function onMouseDown2() {};
    const onMouseUp = function onMouseUp() {};
    const onMouseUp2 = function onMouseUp2() {};
    const onScroll = function onScroll() {};
    const onResize = function onResize() {};
    listenerRegistries.set(target, [
      {name: undefined, type: 'click', fn: onClick, options: false},
      {name: 'foo', type: 'click', fn: onClick2, options: false},
      {name: 'bar', type: 'touchstart', fn: onKeydown, options: false},
      {name: 'baz', type: 'touchstart', fn: onTouchStart, options: false},
      {name: undefined, type: 'touchstart', fn: onFocus2, options: true},
      {name: undefined, type: 'focus', fn: onFocus, options: true},
      {name: undefined, type: 'focus', fn: onFocus2, options: true},
      {name: 'foo', type: 'blur', fn: onTouchStart, options: false},
      {name: 'bar', type: 'blur', fn: onBlur, options: false},
      {name: undefined, type: 'blur', fn: onBlur, options: true},
      {name: undefined, type: 'keydown', fn: onKeydown, options: false},
      {name: 'bar', type: 'keydown', fn: onKeydown, options: true},
      {name: 'baz', type: 'mouseenter', fn: onMouseEnter, options: false},
      {name: undefined, type: 'mouseenter', fn: onMouseEnter2, options: true},
      {name: 'foo', type: 'mousedown', fn: onMouseDown, options: false},
      {name: 'foo', type: 'mouseup', fn: onMouseUp, options: false},
      {name: undefined, type: 'mousedown', fn: onMouseDown2, options: true},
      {name: undefined, type: 'mouseup', fn: onMouseUp2, options: true},
      {name: 'baz', type: 'scroll', fn: onScroll, options: undefined},
      {name: 'baz', type: 'resize', fn: onResize, options: undefined},
    ]);

    removeListener(target, [
      ['click'],
      ['focus', onFocus, {capture: true}],
      ['blur', onBlur, true],
      ['blur', 'bar'],
      ['keydown', onKeydown],
      'mouseenter',
    ]);
    expect(spyREL.callCount, 'to be', 8);
    expect(spyREL.args, 'to equal', [
      ['click', onClick, false],
      ['click', onClick2, false],
      ['focus', onFocus, true],
      ['blur', onBlur, true],
      ['blur', onBlur, false],
      ['keydown', onKeydown, false],
      ['mouseenter', onMouseEnter, false],
      ['mouseenter', onMouseEnter2, true],
    ]);
    expect(listenerRegistries.get(target), 'to equal', [
      {name: 'bar', type: 'touchstart', fn: onKeydown, options: false},
      {name: 'baz', type: 'touchstart', fn: onTouchStart, options: false},
      {name: undefined, type: 'touchstart', fn: onFocus2, options: true},
      {name: undefined, type: 'focus', fn: onFocus2, options: true},
      {name: 'foo', type: 'blur', fn: onTouchStart, options: false},
      {name: 'bar', type: 'keydown', fn: onKeydown, options: true},
      {name: 'foo', type: 'mousedown', fn: onMouseDown, options: false},
      {name: 'foo', type: 'mouseup', fn: onMouseUp, options: false},
      {name: undefined, type: 'mousedown', fn: onMouseDown2, options: true},
      {name: undefined, type: 'mouseup', fn: onMouseUp2, options: true},
      {name: 'baz', type: 'scroll', fn: onScroll, options: undefined},
      {name: 'baz', type: 'resize', fn: onResize, options: undefined},
    ]);

    spyREL.resetHistory();

    removeListener(target, [
      ['touchstart focus', onFocus2, true],
      ['keydown touchstart', 'bar'],
      ['blur touchstart.baz', 'foo'],
      ['mousedown mouseup'],
      '.baz',
    ]);
    expect(spyREL.callCount, 'to be', 12);
    expect(spyREL.args, 'to equal', [
      ['touchstart', onFocus2, true],
      ['focus', onFocus2, true],
      ['keydown', onKeydown, true],
      ['touchstart', onKeydown, false],
      ['blur', onTouchStart, false],
      ['touchstart', onTouchStart, false],
      ['mousedown', onMouseDown, false],
      ['mousedown', onMouseDown2, true],
      ['mouseup', onMouseUp, false],
      ['mouseup', onMouseUp2, true],
      ['scroll', onScroll, undefined],
      ['resize', onResize, undefined],
    ]);
    expect(listenerRegistries.get(target), 'to equal', []);
  });

  it('removes multiple listeners in type:listener object from a target', function () {
    const onClick = function onClick() {};
    const onClick2 = function onClick2() {};
    const onTouchStart = function onTouchStart() {};
    const onFocus = function onFocus() {};
    const onFocus2 = function onFocus2() {};
    const onBlur = function onBlur() {};
    const onKeydown = function onKeydown() {};
    const onMouseDown = function onMouseDown() {};
    const onMouseDown2 = function onMouseDown2() {};
    const onMouseUp = function onMouseUp() {};
    const onMouseUp2 = function onMouseUp2() {};
    const onScroll = function onScroll() {};
    const onResize = function onResize() {};
    listenerRegistries.set(target, [
      {name: undefined, type: 'click', fn: onClick, options: false},
      {name: undefined, type: 'click', fn: onClick2, options: false},
      {name: undefined, type: 'touchstart', fn: onFocus2, options: false},
      {name: 'bar', type: 'touchstart', fn: onKeydown, options: false},
      {name: 'baz', type: 'touchstart', fn: onTouchStart, options: false},
      {name: undefined, type: 'focus', fn: onFocus, options: false},
      {name: undefined, type: 'focus', fn: onFocus2, options: false},
      {name: undefined, type: 'blur', fn: onBlur, options: false},
      {name: 'foo', type: 'blur', fn: onTouchStart, options: false},
      {name: 'foo', type: 'keydown', fn: onKeydown, options: false},
      {name: 'bar', type: 'keydown', fn: onKeydown, options: true},
      {name: 'foo', type: 'mousedown', fn: onMouseDown, options: false},
      {name: undefined, type: 'mousedown', fn: onMouseDown2, options: true},
      {name: 'foo', type: 'mouseup', fn: onMouseUp, options: false},
      {name: undefined, type: 'mouseup', fn: onMouseUp2, options: true},
      {name: 'baz', type: 'scroll', fn: onScroll, options: undefined},
      {name: 'baz', type: 'resize', fn: onResize, options: undefined},
    ]);

    removeListener(target, {
      click: undefined,
      focus: onFocus,
      blur: onBlur,
      keydown: 'foo',
    });
    expect(spyREL.callCount, 'to be', 5);
    expect(spyREL.args, 'to equal', [
      ['click', onClick, false],
      ['click', onClick2, false],
      ['focus', onFocus, false],
      ['blur', onBlur, false],
      ['keydown', onKeydown, false],
    ]);
    expect(listenerRegistries.get(target), 'to equal', [
      {name: undefined, type: 'touchstart', fn: onFocus2, options: false},
      {name: 'bar', type: 'touchstart', fn: onKeydown, options: false},
      {name: 'baz', type: 'touchstart', fn: onTouchStart, options: false},
      {name: undefined, type: 'focus', fn: onFocus2, options: false},
      {name: 'foo', type: 'blur', fn: onTouchStart, options: false},
      {name: 'bar', type: 'keydown', fn: onKeydown, options: true},
      {name: 'foo', type: 'mousedown', fn: onMouseDown, options: false},
      {name: undefined, type: 'mousedown', fn: onMouseDown2, options: true},
      {name: 'foo', type: 'mouseup', fn: onMouseUp, options: false},
      {name: undefined, type: 'mouseup', fn: onMouseUp2, options: true},
      {name: 'baz', type: 'scroll', fn: onScroll, options: undefined},
      {name: 'baz', type: 'resize', fn: onResize, options: undefined},
    ]);

    spyREL.resetHistory();

    removeListener(target, {
      'touchstart focus': onFocus2,
      'keydown touchstart': 'bar',
      'blur touchstart.baz': 'foo',
      'mousedown mouseup': '',
      '.baz': null,
    });
    expect(spyREL.callCount, 'to be', 12);
    expect(spyREL.args, 'to equal', [
      ['touchstart', onFocus2, false],
      ['focus', onFocus2, false],
      ['keydown', onKeydown, true],
      ['touchstart', onKeydown, false],
      ['blur', onTouchStart, false],
      ['touchstart', onTouchStart, false],
      ['mousedown', onMouseDown, false],
      ['mousedown', onMouseDown2, true],
      ['mouseup', onMouseUp, false],
      ['mouseup', onMouseUp2, true],
      ['scroll', onScroll, undefined],
      ['resize', onResize, undefined],
    ]);
    expect(listenerRegistries.get(target), 'to equal', []);
  });

  it('removes all listeners from the target if only target is specified', function () {
    const onClick = function onClick() {};
    const onFocus = function onFocus() {};
    const onBlur = function onBlur() {};
    listenerRegistries.set(target, [
      {name: 'foo', type: 'click', fn: onClick, options: false},
      {name: 'bar', type: 'blur', fn: onBlur, options: false},
      {name: undefined, type: 'click', fn: onClick, options: true},
      {name: 'foo', type: 'focus', fn: onFocus, options: undefined},
    ]);

    removeListener(target);
    expect(spyREL.callCount, 'to be', 4);
    expect(spyREL.args, 'to equal', [
      ['click', onClick, false],
      ['blur', onBlur, false],
      ['click', onClick, true],
      ['focus', onFocus, undefined],
    ]);
    expect(listenerRegistries.get(target), 'to equal', []);
  });
});
