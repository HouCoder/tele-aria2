module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    'no-console': 'off',
    'class-methods-use-this': 'off',
    'function-paren-newline': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
    'max-len': ['error', {
      code: 120,
      ignoreComments: true,
    }],
  },
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'airbnb-typescript',
  ],
  settings: {
    react: {
      // https://github.com/DRD4-7R/eslint-config-7r-building/issues/1#issuecomment-473031376
      version: '999.999.999',
    },
  },
};
