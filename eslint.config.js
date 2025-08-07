import js from '@eslint/js';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { globalIgnores } from 'eslint/config';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config([
  globalIgnores(['dist', 'node_modules']),

  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],

    plugins: {
      prettier: prettierPlugin,
    },

    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      // reactPlugin,
      reactPlugin.configs.flat.recommended,
      reactPlugin.configs.flat['jsx-runtime'],
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
      prettierRecommended,
    ],

    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
  },
]);
