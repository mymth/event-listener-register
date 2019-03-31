describe('addListener()', function () {
  let spyAEL;

  before(function () {
    spyAEL = sinon.spy(target, 'addEventListener');
  });

  after(function () {
    spyAEL.restore();
  });

  afterEach(function () {
    spyAEL.resetHistory();
    listenerRegistries.delete(target);
  });

  it('adds a event listener to a target and returns true', function () {
    const onClick = function onClick() {};
    const onFocus = function onFocus() {};
    const onBlur = function onBlur() {};
    const opts = {capture: true};

    expect(addListener(target, 'click', onClick, true), 'to be true');
    expect(spyAEL.calledWith('click', onClick, true), 'to be true');
    expect(getListenerRegistration(), 'to equal', {
      click: {forBubble: [], forCapture: [onClick], byName: {}},
    });

    spyAEL.resetHistory();

    expect(addListener(target, 'focus', onFocus, opts), 'to be true');
    expect(spyAEL.calledWith('focus', onFocus, opts), 'to be true');
    expect(getListenerRegistration(), 'to equal', {
      click: {forBubble: [], forCapture: [onClick], byName: {}},
      focus: {forBubble: [], forCapture: [onFocus], byName: {}},
    });

    spyAEL.resetHistory();

    expect(addListener(target, 'blur', onBlur), 'to be true');
    expect(spyAEL.calledWith('blur', onBlur), 'to be true');
    expect(getListenerRegistration(), 'to equal', {
      click: {forBubble: [], forCapture: [onClick], byName: {}},
      focus: {forBubble: [], forCapture: [onFocus], byName: {}},
      blur: {forBubble: [onBlur], forCapture: [], byName: {}}
    });

    const onClick2 = function onClick2() {};

    expect(addListener(target, 'click', onClick2), 'to be true');
    expect(getListenerRegistration(), 'to equal', {
      click: {forBubble: [onClick2], forCapture: [onClick], byName: {}},
      focus: {forBubble: [], forCapture: [onFocus], byName: {}},
      blur: {forBubble: [onBlur], forCapture: [], byName: {}}
    });

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

    expect(addListener(target, 'click', onClick, true, 'foo'), 'to be true');
    expect(getListenerRegistration(), 'to equal', {
      click: {
        forBubble: [],
        forCapture: [onClick],
        byName: {foo: {fn: onClick, capture: true}},
      },
    });

    addListener(target, 'focus', onFocus, {capture: true}, 'bar');
    expect(getListenerRegistration(), 'to equal', {
      click: {
        forBubble: [],
        forCapture: [onClick],
        byName: {foo: {fn: onClick, capture: true}},
      },
      focus: {
        forBubble: [],
        forCapture: [onFocus],
        byName: {bar: {fn: onFocus, capture: true}},
      },
    });

    addListener(target, 'click', onClick2, 'baz');
    expect(getListenerRegistration(), 'to equal', {
      click: {
        forBubble: [onClick2],
        forCapture: [onClick],
        byName: {
          foo: {fn: onClick, capture: true},
          baz: {fn: onClick2, capture: false},
        }
      },
      focus: {
        forBubble: [],
        forCapture: [onFocus],
        byName: {bar: {fn: onFocus, capture: true}},
      },
    });

    // same name can be used for different types
    addListener(target, 'focus', onFocus2, 'foo');
    expect(getListenerRegistration(), 'to equal', {
      click: {
        forBubble: [onClick2],
        forCapture: [onClick],
        byName: {
          foo: {fn: onClick, capture: true},
          baz: {fn: onClick2, capture: false},
        },
      },
      focus: {
        forBubble: [onFocus2],
        forCapture: [onFocus],
        byName: {
          bar: {fn: onFocus, capture: true},
          foo: {fn: onFocus2, capture: false},
        },
      },
    });

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

    expect(addListener(target, 'click.foo', onClick, true), 'to be true');
    expect(getListenerRegistration(), 'to equal', {
      click: {
        forBubble: [],
        forCapture: [onClick],
        byName: {foo: {fn: onClick, capture: true}},
      },
    });

    addListener(target, 'click', onClick2, 'bar');
    expect(getListenerRegistration(), 'to equal', {
      click: {
        forBubble: [onClick2],
        forCapture: [onClick],
        byName: {
          foo: {fn: onClick, capture: true},
          bar: {fn: onClick2, capture: false},
        }
      },
    });

    addListener(target, 'focus.foo', onFocus);
    expect(getListenerRegistration(), 'to equal', {
      click: {
        forBubble: [onClick2],
        forCapture: [onClick],
        byName: {
          foo: {fn: onClick, capture: true},
          bar: {fn: onClick2, capture: false},
        },
      },
      focus: {
        forBubble: [onFocus],
        forCapture: [],
        byName: {
          foo: {fn: onFocus, capture: false},
        },
      },
    });

    addListener(target, 'focus.baz', onFocus2, 'bar');
    expect(getListenerRegistration(), 'to equal', {
      click: {
        forBubble: [onClick2],
        forCapture: [onClick],
        byName: {
          foo: {fn: onClick, capture: true},
          bar: {fn: onClick2, capture: false},
        },
      },
      focus: {
        forBubble: [onFocus, onFocus2],
        forCapture: [],
        byName: {
          foo: {fn: onFocus, capture: false},
          baz: {fn: onFocus2, capture: false},
        },
      },
    });

    target.removeEventListener('click', onClick, true);
    target.removeEventListener('click', onClick2);
    target.removeEventListener('focus', onFocus);
    target.removeEventListener('focus', onFocus2);
  })

  it('returns false if the listener or the name is already registered', function () {
    const onClick = function onClick() {};
    const onClick2 = function onClick2() {};
    //
    listenerRegistries.set(target, {
      click: {
        forBubble: new Set([onClick]),
        forCapture: new Set([onClick2]),
        byName: {foo: {fn: onClick2, capture: true}},
      },
    });

    expect(addListener(target, 'click', onClick), 'to be false');
    expect(spyAEL.called, 'to be false');

    expect(addListener(target, 'click', onClick, false, 'foo'), 'to be false');
    expect(spyAEL.called, 'to be false');

    target.removeEventListener('click', onClick);
    target.removeEventListener('click', onClick2, true);
  });

  it('treats same listener with different use-of-capture in a type as separate entries', function () {
    const onClick = function onClick() {};
    const registry = {
      click: {forBubble: new Set([onClick]), forCapture: new Set(),  byName: {}}
    };
    listenerRegistries.set(target, registry);

    expect(addListener(target, 'click', onClick, true), 'to be true');
    expect(getListenerRegistration(), 'to equal', {
      click: {forBubble: [onClick], forCapture: [onClick], byName: {}},
    });
  });

  it('adds a listener to multiple types and returns an array of results if type is space-separated', function () {
    const onClick = function onClick() {};
    const onKeydown = function onKeydown() {};
    const onBlur = function onBlur() {};

    expect(addListener(target, 'click focus', onClick, 'foo'), 'to equal', [true, true]);
    expect(spyAEL.calledTwice, 'to be true');
    expect(spyAEL.args, 'to equal', [
      ['click', onClick, undefined],
      ['focus', onClick, undefined],
    ]);
    expect(getListenerRegistration(), 'to equal', {
      click: {
        forBubble: [onClick],
        forCapture: [],
        byName: {foo: {fn: onClick, capture: false}},
      },
      focus: {
        forBubble: [onClick],
        forCapture: [],
        byName: {foo: {fn: onClick, capture: false}},
      },
    });

    spyAEL.resetHistory();

    expect(addListener(target, 'keydown click', onKeydown, true, 'foo'), 'to equal', [true, false]);
    expect(spyAEL.calledOnce, 'to be true');
    expect(spyAEL.args[0], 'to equal', ['keydown', onKeydown, true]);
    expect(getListenerRegistration(), 'to equal', {
      click: {
        forBubble: [onClick],
        forCapture: [],
        byName: {foo: {fn: onClick, capture: false}},
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
    });

    spyAEL.resetHistory();

    // for click, 'bar' is used for the name (type suffix > name argument)
    expect(addListener(target, 'blur click.bar', onBlur, 'foo'), 'to equal', [true, true]);
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

    target.removeEventListener('click', onClick);
    target.removeEventListener('focus', onClick);
    target.removeEventListener('keydown', onKeydown, true);
    target.removeEventListener('blur', onBlur);
  });

  it('adds multiple listeners in array to a target and returns an array of results', function () {
    const onClick = function onClick() {};
    const onClick2 = function onClick2() {};
    const onBlur = function onBlur() {};
    const onKeydown = function onKeydown() {};
    const onFocus = function onFocus() {};
    const onFocus2 = function onFocus2() {};
    const onClickOpts = {capture: true};

    expect(addListener(target, [
      ['click', onClick, onClickOpts],
      ['blur', onBlur, true, 'foo'],
      ['keydown', onKeydown],
    ]), 'to equal', [true, true, true]);
    expect(spyAEL.calledThrice, 'to be true');
    expect(spyAEL.args, 'to equal', [
      ['click', onClick, onClickOpts],
      ['blur', onBlur, true],
      ['keydown', onKeydown, undefined],
    ]);
    expect(getListenerRegistration(), 'to equal', {
      click: {forBubble: [], forCapture: [onClick], byName: {}},
      blur: {
        forBubble: [],
        forCapture: [onBlur],
        byName: {foo: {fn: onBlur, capture: true}},
      },
      keydown: {forBubble: [onKeydown], forCapture: [], byName: {}},
    });

    expect(addListener(target, [
      ['blur', () => {}, 'foo'],
      ['click', onClick],
      ['keydown', onKeydown],
    ]), 'to equal', [false, true, false]);
    expect(spyAEL.callCount, 'to be', 4);
    expect(spyAEL.args[3], 'to equal', ['click', onClick, undefined]);
    expect(getListenerRegistration(), 'to equal', {
      click: {forBubble: [onClick], forCapture: [onClick], byName: {}},
      blur: {
        forBubble: [],
        forCapture: [onBlur],
        byName: {foo: {fn: onBlur, capture: true}},
      },
      keydown: {forBubble: [onKeydown], forCapture: [], byName: {}},
    });

    spyAEL.resetHistory();

    expect(addListener(target, [
      ['click keydown', onClick2],
      ['click focus', onFocus, 'foo'],
      ['click focus.bar', onFocus2, {capture: true}, 'foo'],
    ]), 'to equal', [
      [true, true],
      [true, true],
      [false, true],
    ]);
    expect(spyAEL.callCount, 'to be', 5);
    expect(spyAEL.args, 'to equal', [
      ['click', onClick2, undefined],
      ['keydown', onClick2, undefined],
      ['click', onFocus, undefined],
      ['focus', onFocus, undefined],
      ['focus', onFocus2, {capture: true}],
    ]);
    expect(getListenerRegistration(), 'to equal', {
      click: {
        forBubble: [onClick, onClick2, onFocus],
        forCapture: [onClick],
        byName: {foo: {fn: onFocus, capture: false}},
      },
      blur: {
        forBubble: [],
        forCapture: [onBlur],
        byName: {foo: {fn: onBlur, capture: true}},
      },
      keydown: {forBubble: [onKeydown, onClick2], forCapture: [], byName: {}},
      focus: {
        forBubble: [onFocus],
        forCapture: [onFocus2],
        byName: {
          foo: {fn: onFocus, capture: false},
          bar: {fn: onFocus2, capture: true},
        }
      }
    });

    target.removeEventListener('click', onClick);
    target.removeEventListener('click', onClick, true);
    target.removeEventListener('blur', onBlur, true);
    target.removeEventListener('keydown', onKeydown);
    target.removeEventListener('click', onClick2);
    target.removeEventListener('keydown', onClick2);
    target.removeEventListener('click', onFocus);
    target.removeEventListener('focus', onFocus);
    target.removeEventListener('focus', onFocus2, true);
  });

  it('adds multiple listeners in type:listener object and returns type:result object', function () {
    const onClick = function onClick() {};
    const onClick2 = function onClick2() {};
    const onBlur = function onBlur() {};
    const onKeydown = function onKeydown() {};
    const onFocus = function onFocus() {};
    const onFocus2 = function onFocus2() {};

    expect(addListener(target, {
      click: onClick,
      blur: onBlur,
      keydown: onKeydown,
    }), 'to equal', {click: true, blur: true, keydown: true});
    expect(spyAEL.calledThrice, 'to be true');
    expect(spyAEL.args, 'to equal', [
      ['click', onClick, undefined],
      ['blur', onBlur, undefined],
      ['keydown', onKeydown, undefined],
    ]);
    expect(getListenerRegistration(), 'to equal', {
      click: {forBubble: [onClick], forCapture: [], byName: {}},
      blur: {forBubble: [onBlur], forCapture: [], byName: {}},
      keydown: {forBubble: [onKeydown], forCapture: [], byName: {}},
    });

    expect(addListener(target, {
      click: onClick2,
      keydown: onKeydown,
    }), 'to equal', {click: true, keydown: false});
    expect(spyAEL.callCount, 'to be', 4);
    expect(spyAEL.args[3], 'to equal', ['click', onClick2, undefined]);
    expect(getListenerRegistration(), 'to equal', {
      click: {forBubble: [onClick, onClick2], forCapture: [], byName: {}},
      blur: {forBubble: [onBlur], forCapture: [], byName: {}},
      keydown: {forBubble: [onKeydown], forCapture: [], byName: {}},
    });

    spyAEL.resetHistory();

    expect(addListener(target, {
      'click keydown': onClick2,
      'click.foo focus.foo': onFocus,
      'click.foo focus.bar': onFocus2,
    }), 'to equal', {
      'click keydown': [false, true],
      'click.foo focus.foo': [true, true],
      'click.foo focus.bar': [false, true],
    });
    expect(spyAEL.callCount, 'to be', 4);
    expect(spyAEL.args, 'to equal', [
      ['keydown', onClick2, undefined],
      ['click', onFocus, undefined],
      ['focus', onFocus, undefined],
      ['focus', onFocus2, undefined],
    ]);
    expect(getListenerRegistration(), 'to equal', {
      click: {
        forBubble: [onClick, onClick2, onFocus],
        forCapture: [],
        byName: {foo: {fn: onFocus, capture: false}},
      },
      blur: {forBubble: [onBlur], forCapture: [], byName: {}},
      keydown: {forBubble: [onKeydown, onClick2], forCapture: [], byName: {}},
      focus: {
        forBubble: [onFocus, onFocus2],
        forCapture: [],
        byName: {
          foo: {fn: onFocus, capture: false},
          bar: {fn: onFocus2, capture: false},
        },
      },
    });

    target.removeEventListener('click', onClick);
    target.removeEventListener('click', onClick2);
    target.removeEventListener('blur', onBlur, true);
    target.removeEventListener('keydown', onKeydown);
    target.removeEventListener('keydown', onClick2);
    target.removeEventListener('click', onFocus);
    target.removeEventListener('focus', onFocus);
    target.removeEventListener('focus', onFocus2, true);
  });
});
