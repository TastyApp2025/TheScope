import js from '@eslint/js';
import react from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['dist/', 'node_modules/', 'build/', '.vite/', '.vscode/'],
  },
  {
    files: ['client/src/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        React: 'readonly',
        JSX: 'readonly',
        window: 'readonly',
        document: 'readonly',
        fetch: 'readonly',
        console: 'readonly',
        navigator: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        Audio: 'readonly',
        TouchEvent: 'readonly',
        HTMLAudioElement: 'readonly',
        HTMLImageElement: 'readonly',
        alert: 'readonly',
      },
    },
    plugins: {
      react,
    },
    rules: {
      'no-undef': 'error',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'warn',
      'react/jsx-uses-vars': 'warn',
    },
  },
];
