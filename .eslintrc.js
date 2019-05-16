module.exports = {
  env: {
    es6: true,
    browser: true,
  },
  extends: 'eslint:recommended',
  parserOptions: {
    sourceType: "module"
  },
  overrides: [
    {
      files: ['test/**'],
      env: {
        mocha: true,
      },
      parserOptions: {
        sourceType: 'script',
      },
      globals: {
        weknowhow: 'readonly',
        expect: 'readonly',
        sinon: 'readonly',
        origWeakMap: 'readonly',
        listenerRegistries: 'readonly',
        listenerRegsiter: 'readonly',
        testContainer: 'readonly',
        addListener: 'readonly',
        removeListener: 'readonly',
        getListeners: 'readonly',
        getListenerRegistration: 'readonly',
      },
    },
  ],
};
