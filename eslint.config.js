import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import pluginCypress from 'eslint-plugin-cypress';
import pluginVitest from '@vitest/eslint-plugin';

export default defineConfig([
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,js,mjs,jsx}'],
  },

  globalIgnores([
    '**/dist/**',
    '**/dist-ssr/**',
    '**/coverage/**',
    'docs/**',
    'themes/**',
  ]),

  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],

  {
    ...pluginCypress.configs.recommended,
    files: ['cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}', 'cypress/support/**/*.{js,ts,jsx,tsx}'],
  },

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },

  {
    rules: {
      'comma-dangle': ['error', 'always-multiline'],
      eqeqeq: ['error', 'always'],
      indent: ['error', 2],
      'no-eval': ['error'],
      'no-trailing-spaces': ['error'],
      'no-unused-vars': ['error'],
      'no-var': ['error'],
      'prefer-const': ['error'],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'no-undef': ['error'],
      'no-console': ['warn'],
      'consistent-return': ['error'],
      'no-mixed-spaces-and-tabs': ['warn'],
      'no-multiple-empty-lines': ['warn', { max: 1 }],
      'no-multi-spaces': ['warn'],
      'no-lonely-if': ['warn'],
      camelcase: ['error', { properties: 'always' }],
      'vue/no-unused-vars': ['warn'],
      'vue/no-unused-components': ['warn'],
      'vue/html-end-tags': ['error'],
      'vue/no-lone-template': ['error'],
      'vue/no-use-v-if-with-v-for': ['error'],
    },
  },
]);
