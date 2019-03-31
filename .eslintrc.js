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
        weknowhow: true,
        expect: true,
        sinon: true,
        origWeakMap: true,
        listenerRegistries: true,
        listenerRegsiter: true,
        target: true,
        addListener: true,
        removeListener: true,
        getListenerRegistration: true,
      },
    },
  ],
};
