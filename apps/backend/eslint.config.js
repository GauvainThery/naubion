import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      ...tseslint.configs.recommended.rules
    }
  },
  prettierConfig,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        project: './tsconfig.json'
      },
      globals: {
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        console: 'readonly',
        global: 'readonly',
        // Browser globals for evaluation context
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        URL: 'readonly',
        Event: 'readonly',
        MouseEvent: 'readonly',
        HTMLElement: 'readonly',
        HTMLImageElement: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: prettierPlugin
    },
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-unused-vars': 'off', // Turn off base rule to use TypeScript version
      'no-console': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',
      camelcase: ['error', { properties: 'never' }],
      'no-multiple-empty-lines': ['error', { max: 2 }]
    }
  }
];
