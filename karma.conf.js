// eslint.config.mjs
import js from '@eslint/js';
import { plugin as tsPlugin, configs as tsConfigs } from '@typescript-eslint/eslint-plugin';
import { parser as tsParser } from '@typescript-eslint/parser';
import { plugin as angularPlugin, configs as angularConfigs } from '@angular-eslint/eslint-plugin';
import { parser as angularTemplateParser, configs as angularTemplateConfigs } from '@angular-eslint/template';

export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      '@angular-eslint': angularPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tsConfigs.recommended.rules,
      ...tsConfigs.stylistic.rules,
      ...angularConfigs.recommended.rules,
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error', // Correctly placed
    },
  },
  {
    files: ['**/*.html'],
    languageOptions: {
      parser: angularTemplateParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@angular-eslint/template': angularPlugin,
    },
    rules: {
      ...angularTemplateConfigs.recommended.rules,
      ...angularTemplateConfigs.accessibility.rules,
    },
  },
];
