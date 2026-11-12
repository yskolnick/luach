import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'docs/.vitepress/**', 'apps/**', 'coverage/**', 'examples/**', '.claude/**', '.remember/**'] },
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    rules: {
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-restricted-globals': ['error', 'fetch', 'XMLHttpRequest', 'WebSocket'],
      'no-restricted-imports': ['error', { patterns: ['node:*', 'fs', 'path', 'http', 'https', 'net'] }],
      // A function that takes a date checks it with src/calendar/date-input.ts, which reads a
      // HebrewDate from another copy of the library and rejects the wrong kind of date.
      'no-restricted-syntax': ['error', { selector: "BinaryExpression[operator='instanceof'][right.name='HebrewDate']", message: 'Use isHebrewDate, dayArg or hebrewDateArg from calendar/date-input.ts.' }],
    },
  },
);
