import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import importPlugin from 'eslint-plugin-import';
import boundaries from 'eslint-plugin-boundaries';

/**
 * Feature-Sliced Design layers. Imports flow downward only:
 *   app -> pages -> widgets -> features -> entities -> shared
 *
 * Read frontend/src/<layer>/README.md before changing dependencies.
 */
const LAYERS = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'];

/** Everything strictly below `layer`, plus the layer itself. */
const below = (layer) => {
  const i = LAYERS.indexOf(layer);
  return LAYERS.slice(i);
};

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'frontend/dist/**',
      'coverage/**',
      'node_modules/**',
      'html/**',
      'test-results/**',
      'playwright-report/**',
    ],
  },

  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,

  /* Plain JS/MJS files (this config, the CI scripts) are not in a TS project —
     no type-aware rules for them, or ESLint fails to load before linting anything. */
  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { globals: globals.node },
    rules: { 'import/no-default-export': 'off' },
  },

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      import: importPlugin,
      boundaries,
    },
    settings: {
      'boundaries/include': ['frontend/src/**/*'],
      'boundaries/ignore': ['frontend/src/main.tsx'],
      'boundaries/elements': [
        { type: 'app', pattern: 'frontend/src/app/**' },
        { type: 'pages', pattern: 'frontend/src/pages/**' },
        { type: 'widgets', pattern: 'frontend/src/widgets/**' },
        { type: 'features', pattern: 'frontend/src/features/**' },
        { type: 'entities', pattern: 'frontend/src/entities/**' },
        { type: 'shared', pattern: 'frontend/src/shared/**' },
      ],
      'import/resolver': {
        typescript: { alwaysTryTypes: true },
        node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      /* CLAUDE.md ground rules — errors, not warnings. */
      '@typescript-eslint/no-explicit-any': 'error',
      // A leading underscore marks a binding that exists only to be discarded
      // by destructuring (pulling `as` off before spreading the rest).
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-ignore': true, 'ts-expect-error': 'allow-with-description', 'ts-nocheck': true },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],

      /* Default exports are banned outside frontend/src/main.tsx. */
      'import/no-default-export': 'error',

      /* Layer boundaries. An upward import is a build failure. */
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          message:
            '{{from.element.type}} may not import {{to.element.type}}. Imports flow downward only: app -> pages -> widgets -> features -> entities -> shared.',
          policies: [
            // Each layer may reach itself and anything strictly below it.
            ...LAYERS.map((layer) => ({
              from: { element: { type: layer } },
              allow: { to: { element: { types: { anyOf: below(layer) } } } },
            })),
          ],
        },
      ],
      'boundaries/no-unknown': 'off',
      'boundaries/no-private': 'off',
    },
  },

  /* The entry point is the one place a default import/export is expected. */
  {
    files: ['frontend/src/main.tsx'],
    rules: { 'import/no-default-export': 'off' },
  },

  /* Config files run in Node and legitimately default-export. */
  {
    files: ['*.config.{js,ts}', 'frontend/test/setup.ts'],
    languageOptions: { globals: globals.node },
    rules: {
      'import/no-default-export': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },

  /* Tests may reach for test-only ergonomics. */
  {
    files: ['**/*.test.{ts,tsx}', 'frontend/test/setup.ts'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
    },
  },
);
