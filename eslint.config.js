import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'docs/.vitepress/**', 'apps/**', 'coverage/**', 'examples/**'] },
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    rules: {
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-restricted-globals': ['error', 'fetch', 'XMLHttpRequest', 'WebSocket'],
      'no-restricted-imports': ['error', { patterns: ['node:*', 'fs', 'path', 'http', 'https', 'net'] }],
    },
  },
);
