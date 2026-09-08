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
 * `legacy` holds the pre-FSD code that shipped before this config existed.
 * It is migrated in prompts 8-11; see the deviations table in ARCHITECTURE.md.
 * Do not add new files to it, and do not relax the rules below — read
 * src/<layer>/README.md instead.
 */
const LAYERS = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'];

/** Everything strictly below `layer`, plus the layer itself. */
const below = (layer) => {
  const i = LAYERS.indexOf(layer);
  return LAYERS.slice(i);
};

export default tseslint.config(
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**', 'html/**', 'test-results/**', 'playwright-report/**'],
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
      'boundaries/include': ['src/**/*'],
      // Outside the layer graph:
      //  - the entry point, and App.tsx until it moves into `app` in prompt 7;
      //  - src/mocks, which is dev and test infrastructure (MSW). It reaches into
      //    entities for their types, which no real layer below `app` may do.
      'boundaries/ignore': ['src/main.tsx', 'src/App.tsx', 'src/mocks/**'],
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app/**' },
        { type: 'pages', pattern: 'src/pages/**' },
        { type: 'widgets', pattern: 'src/widgets/**' },
        { type: 'features', pattern: 'src/features/**' },
        { type: 'entities', pattern: 'src/entities/**' },
        { type: 'shared', pattern: 'src/shared/**' },
        // Folder patterns only — element descriptors match folders, not files.
        { type: 'legacy', pattern: ['src/components', 'src/data', 'src/store', 'src/types'] },
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

      /* Default exports are banned outside src/main.tsx. */
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
            // app is the composition root and may still reach the legacy tree.
            {
              from: { element: { type: 'app' } },
              allow: { to: { element: { types: { anyOf: [...LAYERS, 'legacy'] } } } },
            },
            // Legacy code may go downward into shared/entities, or sideways within itself.
            {
              from: { element: { type: 'legacy' } },
              allow: { to: { element: { types: { anyOf: ['legacy', 'shared', 'entities'] } } } },
            },
          ],
        },
      ],
      'boundaries/no-unknown': 'off',
      'boundaries/no-private': 'off',
    },
  },

  /* The entry point is the one place a default import/export is expected. */
  {
    files: ['src/main.tsx'],
    rules: { 'import/no-default-export': 'off' },
  },

  /* Config files run in Node and legitimately default-export. */
  {
    files: ['*.config.{js,ts}', 'vitest.setup.ts'],
    languageOptions: { globals: globals.node },
    rules: {
      'import/no-default-export': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },

  /**
   * Legacy pre-FSD code. Held to a lower bar only until prompts 8-11 migrate it.
   * Every exemption here is listed in the deviations table in ARCHITECTURE.md.
   * Do not extend this block to new files.
   */
  {
    files: [
      'src/components/**/*.{ts,tsx}',
      'src/data/**/*.{ts,tsx}',
      'src/store/**/*.{ts,tsx}',
      'src/types/**/*.{ts,tsx}',
      'src/App.tsx',
    ],
    rules: {
      'import/no-default-export': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  /* Tests may reach for test-only ergonomics. */
  {
    files: ['**/*.test.{ts,tsx}', 'vitest.setup.ts'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
    },
  },
);
