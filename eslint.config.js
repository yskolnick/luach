import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'docs/.vitepress/cache/**', 'docs/.vitepress/dist/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['scripts/**', 'test/**', 'examples/**', '*.config.*'],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    // Oracle tests wrap other libraries' loosely typed objects.
    files: ['test/oracle/**'],
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  },
  {
    files: ['**/*.cjs'],
    languageOptions: { sourceType: 'commonjs', globals: { ...globals.node } },
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  {
    files: ['src/**/*.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        { selector: 'ClassDeclaration', message: 'No class syntax in src/ (Hermes CLI, tree-shaking). See ADR-0002.' },
        { selector: 'ClassExpression', message: 'No class syntax in src/. See ADR-0002.' },
      ],
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'No network calls in the library.' },
        { name: 'XMLHttpRequest', message: 'No network calls in the library.' },
        { name: 'WebSocket', message: 'No network calls in the library.' },
      ],
      'no-eval': 'error',
      'no-new-func': 'error',
      'no-implied-eval': 'error',
    },
  },
);
