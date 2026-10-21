import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'docs/.vitepress/cache/**', 'docs/.vitepress/dist/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
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
