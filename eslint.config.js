import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const forbiddenCoreGlobals = [
  'document',
  'window',
  'navigator',
  'localStorage',
  'sessionStorage',
  'HTMLElement',
  'SVGElement',
  'requestAnimationFrame',
];

const forbiddenCorePackages = [
  { name: 'react', message: 'packages/core must not import a UI framework.' },
  { name: 'react-dom', message: 'packages/core must not import a UI framework.' },
  { name: '@trefoil/render-svg', message: 'packages/core must not import a renderer.' },
  { name: '@trefoil/export', message: 'packages/core must not import an exporter.' },
];

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      'reference/**',
      'openspec/**',
      '.beans/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.js', 'scripts/*.mjs'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true },
      ],
    },
  },
  {
    files: ['packages/core/**/*.ts', 'packages/templates/**/*.ts'],
    rules: {
      'no-restricted-globals': [
        'error',
        ...forbiddenCoreGlobals.map((name) => ({
          name,
          message: `The core is framework-free and runs without a DOM. "${name}" is not available there.`,
        })),
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: forbiddenCorePackages,
          patterns: [
            {
              group: ['**/render-*', '**/apps/**'],
              message: 'packages/core must not reach into a renderer or the studio.',
            },
          ],
        },
      ],
      'no-restricted-properties': [
        'error',
        {
          object: 'Math',
          property: 'random',
          message: 'The core is deterministic. Randomness comes from a seed passed in by the caller.',
        },
        {
          object: 'Date',
          property: 'now',
          message: 'The core is deterministic. It must not read the clock.',
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "NewExpression[callee.name='Date']",
          message: 'The core is deterministic. It must not read the clock.',
        },
      ],
    },
  },
  {
    files: ['**/*.js', '**/*.mjs', 'apps/**/vite.config.ts'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      globals: globals.nodeBuiltin,
    },
  },
  {
    files: ['apps/studio/src/**/*.ts'],
    languageOptions: {
      globals: globals.browser,
    },
  },
);
