module.exports = {
  root: true,
  env: {
    browser: true,
  },
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  parserOptions: {
    project: './tsconfig.json',
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
    },
  },
  settings: {
    react: {
      version: 'detect', // Tells eslint-plugin-react to automatically detect the version of React to use
    },
  },
  extends: ['airbnb-typescript'],
  rules: {
    'linebreak-style': 'off',
    'react/jsx-one-expression-per-line': 'off',
    'react/prop-types': 'off',
    'no-bitwise': 'off',
    'no-param-reassign': 'off',
    'react/destructuring-assignment': 'off',
    'implicit-arrow-linebreak': 'off',
    'no-mixed-operators': 'off',
    'no-console': 'off',
    'max-len': ['error', { code: 140 }],
  },
};
