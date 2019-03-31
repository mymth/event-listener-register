describe('removeListener()', function () {
  let spyREL;

  before(function () {
    spyREL = sinon.spy(target, 'removeEventListener');
  });

  after(function () {
    spyREL.restore();
  });

  afterEach(function () {
    spyREL.resetHistory();
    listenerRegistries.delete(target);
  });

  it('removes a event listener from a target', function () {
    const onClick = function onClick() {};
    const onClick2 = function onClick2() {};
    const onFocus = function onFocus() {};
    const onBlur = function onBlur() {};
    listenerRegistries.set(target, {
      click: {
        forBubble: new Set([onClick, onClick2]),
        forCapture: new Set([onClick]),
        byName: {}
      },
      focus: {
        forBubble: new Set([onFocus]),
        forCapture: new Set(),
        byName: {},
      },
      blur: {
        forBubble: new Set(),
        forCapture: new Set([onBlur]),
        byName: {},
      },
    });

    removeListener(target, 'click', onClick, {capture: true});
    expect(spyREL.calledWith('click', onClick, true), 'to be true');
    expect(getListenerRegistration(), 'to equal', {
      click: {forBubble: [onClick, onClick2], forCapture: [], byName: {}},
      focus: {forBubble: [onFocus], forCapture: [], byName: {}},
      blur: {forBubble: [], forCapture: [onBlur], byName: {}},
    });

    spyREL.resetHistory();

    removeListener(target, 'blur', onBlur, true);
    expect(spyREL.calledWith('blur', onBlur, true), 'to be true');
    expect(getListenerRegistration(), 'to equal', {
      click: {forBubble: [onClick, onClick2], forCapture: [], byName: {}},
      focus: {forBubble: [onFocus], forCapture: [], byName: {}},
      blur: {forBubble: [], forCapture: [], byName: {}},
    });

    spyREL.resetHistory();

    removeListener(target, 'click', onClick);
    expect(spyREL.calledWith('click', onClick), 'to be true');
    expect(getListenerRegistration(), 'to equal', {
      click: {forBubble: [onClick2], forCapture: [], byName: {}},
      focus: {forBubble: [onFocus], forCapture: [], byName: {}},
      blur: {forBubble: [], forCapture: [], byName: {}},
    });
  });

  it('removes a event listener by reference name', function () {
    const onClick = function onClick() {};
    const onClick2 = function onClick2() {};
    const onFocus = function onFocus() {};
    const onBlur = function onBlur() {};
    listenerRegistries.set(target, {
      click: {
        forBubble: new Set([onClick, onClick2]),
        forCapture: new Set([onClick]),
        byName: {
          foo: {fn: onClick, capture: false},
          bar: {fn: onClick, capture: true},
        },
      },
      focus: {
        forBubble: new Set([onFocus]),
        forCapture: new Set(),
        byName: {baz: {fn: onFocus, capture: false}},
      },
      blur: {
        forBubble: new Set(),
        forCapture: new Set([onBlur]),
        byName: {bam: {fn: onBlur, capture: true}},
      },
    });

    removeListener(target, 'click', 'bar');
    expect(spyREL.calledWith('click', onClick, true), 'to be true');
    expect(getListenerRegistration(), 'to equal', {
      click: {
        forBubble: [onClick, onClick2],
        forCapture: [],
        byName: {foo: {fn: onClick, capture: false}},
      },
      focus: {
        forBubble: [onFocus],
        forCapture: [],
        byName: {baz: {fn: onFocus, capture: false}},
      },
      blur: {
        forBubble: [],
        forCapture: [onBlur],
        byName: {bam: {fn: onBlur, capture: true}},
      },
    });

    spyREL.resetHistory();

    removeListener(target, 'blur', 'bam');
    expect(spyREL.calledWith('blur', onBlur, true), 'to be true');
    expect(getListenerRegistration(), 'to equal', {
      click: {
        forBubble: [onClick, onClick2],
        forCapture: [],
        byName: {foo: {fn: onClick, capture: false}},
      },
      focus: {
        forBubble: [onFocus],
        forCapture: [],
        byName: {baz: {fn: onFocus, capture: false}},
      },
      blur: {forBubble: [], forCapture: [], byName: {}},
    });

    spyREL.resetHistory();

    removeListener(target, 'click', 'foo');
    expect(spyREL.calledWith('click', onClick), 'to be true');
    expect(getListenerRegistration(), 'to equal', {
      click: {forBubble: [onClick2], forCapture: [], byName: {}},
      focus: {
        forBubble: [onFocus],
        forCapture: [],
        byName: {baz: {fn: onFocus, capture: false}},
      },
      blur: {forBubble: [], forCapture: [], byName: {}},
    });
  });

  it('takes the suffix in type as name and overrides name argument with it', function () {
    const onClick = function onClick() {};
    const onClick2 = function onClick2() {};
    listenerRegistries.set(target, {
      click: {
        forBubble: new Set([onClick, onClick2]),
        forCapture: new Set([onClick]),
        byName: {
          foo: {fn: onClick, capture: false},
          bar: {fn: onClick, capture: true},
        },
      },
    });

    removeListener(target, 'click.bar', 'foo');
    expect(spyREL.calledWith('click', onClick, true), 'to be true');
    expect(getListenerRegistration(), 'to equal', {
      click: {
        forBubble: [onClick, onClick2],
        forCapture: [],
        byName: {foo: {fn: onClick, capture: false}},
      },
    });

    spyREL.resetHistory();

    removeListener(target, 'click.foo');
    expect(spyREL.calledWith('click', onClick), 'to be true');
    expect(getListenerRegistration(), 'to equal', {
      click: {forBubble: [onClick2], forCapture: [], byName: {}},
    });
  });

  it('removes named listener even if the function is passed', function () {
    const onClick = function onClick() {};
    // const click_0 = [onClick, true, 'foo'];
    listenerRegistries.set(target, {
      click: {
        forBubble: new Set(),
        forCapture: new Set([onClick]),
        byName: {foo: {fn: onClick, capture: true}},
      },
    });

    removeListener(target, 'click', onClick, true);
    expect(getListenerRegistration(), 'to equal', {
      click: {forBubble: [], forCapture: [], byName: {}},
    });
  });

  it('removes all event listeners for a type from a target if listener is not specified', function () {
    const onClick = function onClick() {};
    const onClick2 = function onClick2() {};
    listenerRegistries.set(target, {
      click: {
        forBubble: new Set([onClick, onClick2]),
        forCapture: new Set([onClick]),
        byName: {},
      },
    });

    removeListener(target, 'click');
    expect(spyREL.calledThrice, 'to be true');
    expect(spyREL.args, 'to equal', [
      ['click', onClick, false],
      ['click', onClick2, false],
      ['click', onClick, true],
    ]);
    expect(getListenerRegistration(), 'to equal', {
      click: {forBubble: [], forCapture: [], byName: {}},
    });
  });

  it('remove a listener from multiple types if type is space-separated', function () {
    const onClick = function onClick() {};
    const onFocus = function onFocus() {};
    const onKeydown = function onKeydown() {};
    const onBlur = function onBlur() {};
    listenerRegistries.set(target, {
      click: {
        forBubble: new Set([onClick, onBlur]),
        forCapture: new Set([onFocus]),
        byName: {
          foo: {fn: onClick, capture: false},
          bar: {fn: onBlur, capture: false},
        },
      },
      focus: {
        forBubble: new Set([onClick]),
        forCapture: new Set([onFocus]),
        byName: {foo: {fn: onClick, capture: false}},
      },
      keydown: {
        forBubble: new Set(),
        forCapture: new Set([onKeydown]),
        byName: {foo: {fn: onKeydown, capture: true}},
      },
      blur: {
        forBubble: new Set([onBlur]),
        forCapture: new Set(),
        byName: {foo: {fn: onBlur, capture: false}},
      }
    });

    removeListener(target, 'click focus', onFocus, true);
    expect(spyREL.calledTwice, 'to be true');
    expect(spyREL.args, 'to equal', [
      ['click', onFocus, true],
      ['focus', onFocus, true],
    ]);
    expect(getListenerRegistration(), 'to equal', {
      click: {
        forBubble: [onClick, onBlur],
        forCapture: [],
        byName: {
          foo: {fn: onClick, capture: false},
          bar: {fn: onBlur, capture: false},
        },
      },
      focus: {
        forBubble: [onClick],
        forCapture: [],
        byName: {foo: {fn: onClick, capture: false}},
      },
      keydown: {
        forBubble: [],
        forCapture: [onKeydown],
        byName: {foo: {fn: onKeydown, capture: true}},
      },
      blur: {
        forBubble: [onBlur],
        forCapture: [],
        byName: {foo: {fn: onBlur, capture: false}},
      }
    });

    spyREL.resetHistory();

    removeListener(target, 'keydown click', 'foo');
    expect(spyREL.calledTwice, 'to be true');
    expect(spyREL.args, 'to equal', [
      ['keydown', onKeydown, true],
      ['click', onClick, false],
    ]);
    expect(getListenerRegistration(), 'to equal', {
      click: {
        forBubble: [onBlur],
        forCapture: [],
        byName: {bar: {fn: onBlur, capture: false}},
      },
      focus: {
        forBubble: [onClick],
        forCapture: [],
        byName: {foo: {fn: onClick, capture: false}},
      },
      keydown: {forBubble: [], forCapture: [], byName: {}},
      blur: {
        forBubble: [onBlur],
        forCapture: [],
        byName: {foo: {fn: onBlur, capture: false}},
      }
    });

    spyREL.resetHistory();

    // for click, 'bar' is used for the name (type suffix > name argument)
    removeListener(target, 'blur click.bar', 'foo');
    expect(spyREL.args, 'to equal', [
      ['blur', onBlur, false],
      ['click', onBlur, false],
    ]);
    expect(getListenerRegistration(), 'to equal', {
      click: {forBubble: [], forCapture: [], byName: {}},
      focus: {
        forBubble: [onClick],
        forCapture: [],
        byName: {foo: {fn: onClick, capture: false}},
      },
      keydown: {forBubble: [], forCapture: [], byName: {}},
      blur: {forBubble: [], forCapture: [],  byName: {}}
    });
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
    listenerRegistries.set(target, {
      click: {
        forBubble: new Set([onClick, onClick2]),
        forCapture: new Set(),
        byName: {foo: {fn: onClick2, capture: false}},
      },
      touchstart: {
        forBubble: new Set([onKeydown, onTouchStart]),
        forCapture: new Set([onFocus2]),
        byName: {
          bar: {fn: onKeydown, capture: false},
          baz: {fn: onTouchStart, capture: false},
        },
      },
      focus: {
        forBubble: new Set([onFocus]),
        forCapture: new Set([onFocus, onFocus2]),
        byName: {}
      },
      blur: {
        forBubble: new Set([onTouchStart, onBlur]),
        forCapture: new Set([onBlur]),
        byName: {
          foo: {fn: onTouchStart, capture: false},
          bar: {fn: onBlur, capture: false},
        },
      },
      keydown: {
        forBubble: new Set([onKeydown]),
        forCapture: new Set([onKeydown]),
        byName: {bar: {fn: onKeydown, capture: true}},
      },
      mouseenter: {
        forBubble: new Set([onMouseEnter]),
        forCapture: new Set([onMouseEnter2]),
        byName: {baz: {fn: onMouseEnter, capture: false}},
      },
      mousedown: {
        forBubble: new Set([onMouseDown]),
        forCapture: new Set([onMouseDown2]),
        byName: {foo: {fn: onMouseDown, capture: false}},
      },
      mouseup: {
        forBubble: new Set([onMouseUp]),
        forCapture: new Set([onMouseUp2]),
        byName: {foo: {fn: onMouseUp, capture: false}},
      },
    });

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
    expect(getListenerRegistration(), 'to equal', {
      click: {forBubble: [], forCapture: [], byName: {}},
      touchstart: {
        forBubble: [onKeydown, onTouchStart],
        forCapture: [onFocus2],
        byName: {
          bar: {fn: onKeydown, capture: false},
          baz: {fn: onTouchStart, capture: false},
        },
      },
      focus: {forBubble: [onFocus], forCapture: [onFocus2], byName: {}},
      blur: {
        forBubble: [onTouchStart],
        forCapture: [],
        byName: {foo: {fn: onTouchStart, capture: false}},
      },
      keydown: {
        forBubble: [],
        forCapture: [onKeydown],
        byName: {bar: {fn: onKeydown, capture: true}},
      },
      mouseenter: {forBubble: [], forCapture: [], byName: {}},
      mousedown: {
        forBubble: [onMouseDown],
        forCapture: [onMouseDown2],
        byName: {foo: {fn: onMouseDown, capture: false}},
      },
      mouseup: {
        forBubble: [onMouseUp],
        forCapture: [onMouseUp2],
        byName: {foo: {fn: onMouseUp, capture: false}},
      },
    });

    spyREL.resetHistory();

    removeListener(target, [
      ['touchstart focus', onFocus2, true],
      ['keydown touchstart', 'bar'],
      ['blur touchstart.baz', 'foo'],
      ['mousedown mouseup'],
    ]);
    expect(spyREL.callCount, 'to be', 10);
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
    ]);
    expect(getListenerRegistration(), 'to equal', {
      click: {forBubble: [], forCapture: [], byName: {}},
      touchstart: {forBubble: [], forCapture: [], byName: {}},
      focus: {forBubble: [onFocus], forCapture: [], byName: {}},
      blur: {forBubble: [], forCapture: [], byName: {}},
      keydown: {forBubble: [], forCapture: [], byName: {}},
      mouseenter: {forBubble: [], forCapture: [], byName: {}},
      mousedown: {forBubble: [], forCapture: [], byName: {}},
      mouseup: {forBubble: [], forCapture: [], byName: {}},
    });

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
    listenerRegistries.set(target, {
      click: {
        forBubble: new Set([onClick, onClick2]),
        forCapture: new Set(),
        byName: {},
      },
      touchstart: {
        forBubble: new Set([onKeydown, onTouchStart, onFocus2]),
        forCapture: new Set(),
        byName: {
          bar: {fn: onKeydown, capture: false},
          baz: {fn: onTouchStart, capture: false},
        },
      },
      focus: {
        forBubble: new Set([onFocus, onFocus2]),
        forCapture: new Set([onFocus]),
        byName: {},
      },
      blur: {
        forBubble: new Set([onBlur, onTouchStart]),
        forCapture: new Set(),
        byName: {foo: {fn: onTouchStart, capture: false}},
      },
      keydown: {
        forBubble: new Set([onKeydown]),
        forCapture: new Set([onKeydown]),
        byName: {
          foo: {fn: onKeydown, capture: false},
          bar: {fn: onKeydown, capture: true},
        },
      },
      mousedown: {
        forBubble: new Set([onMouseDown]),
        forCapture: new Set([onMouseDown2]),
        byName: {foo: {fn: onMouseDown, capture: false}},
      },
      mouseup: {
        forBubble: new Set([onMouseUp]),
        forCapture: new Set([onMouseUp2]),
        byName: {foo: {fn: onMouseUp, capture: false}},
      },
    });

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
    expect(getListenerRegistration(), 'to equal', {
      click: {forBubble: [], forCapture: [], byName: {}},
      touchstart: {
        forBubble: [onKeydown, onTouchStart, onFocus2],
        forCapture: [],
        byName: {
          bar: {fn: onKeydown, capture: false},
          baz: {fn: onTouchStart, capture: false},
        },
      },
      focus: {forBubble: [onFocus2], forCapture: [onFocus], byName: {}},
      blur: {
        forBubble: [onTouchStart],
        forCapture: [],
        byName: {foo: {fn: onTouchStart, capture: false}},
      },
      keydown: {
        forBubble: [],
        forCapture: [onKeydown],
        byName: {bar: {fn: onKeydown, capture: true}}},
      mousedown: {
        forBubble: [onMouseDown],
        forCapture: [onMouseDown2],
        byName: {foo: {fn: onMouseDown, capture: false}},
      },
      mouseup: {
        forBubble: [onMouseUp],
        forCapture: [onMouseUp2],
        byName: {foo: {fn: onMouseUp, capture: false}},
      },
    });

    spyREL.resetHistory();

    removeListener(target, {
      'touchstart focus': onFocus2,
      'keydown touchstart': 'bar',
      'blur touchstart.baz': 'foo',
      'mousedown mouseup': '',
    });
    expect(spyREL.callCount, 'to be', 10);
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
    ]);
    expect(getListenerRegistration(), 'to equal', {
      click: {forBubble: [], forCapture: [], byName: {}},
      touchstart: {forBubble: [], forCapture: [], byName: {}},
      focus: {forBubble: [], forCapture: [onFocus], byName: {}},
      blur: {forBubble: [], forCapture: [], byName: {}},
      keydown: {forBubble: [], forCapture: [], byName: {}},
      mousedown: {forBubble: [], forCapture: [], byName: {}},
      mouseup: {forBubble: [], forCapture: [], byName: {}},
    });
  });
});
