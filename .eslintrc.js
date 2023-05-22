module.exports = {
  root: true,
  extends: 'airbnb-base',
  env: {
    browser: true,
  },
  globals: {
    store: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    requireConfigFile: false,
  },
  rules: {
    // allow reassigning param
    'no-param-reassign': [2, { props: false }],
    'linebreak-style': ['error', 'unix'],
    'import/extensions': ['error', {
      js: 'always',
    }],
    'no-restricted-syntax': 0,
    // Temp disable for development
    'no-console': 0,
    'no-underscore-dangle': 0,
  },
};
