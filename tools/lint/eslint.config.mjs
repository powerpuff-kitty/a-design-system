import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import { workspaceImports } from '../../scripts/workspace-imports.mjs';

export default defineConfig(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/playwright-report/**',
      '**/test-results/**',
      '**/release-artifacts/**',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    extends: [tseslint.configs.recommended],
    languageOptions: { globals: globals.browser },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['**/*.mjs', 'playwright.config.ts'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['packages/**/*.ts', 'apps/**/*.ts'],
    plugins: { ads: { rules: { 'workspace-imports': workspaceImports } } },
    rules: { 'ads/workspace-imports': 'error' },
  },
);
