import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['**/dist/**', '**/node_modules/**', 'reference/**', 'coverage/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.ts', '*.js'],
          defaultProject: 'tsconfig.tools.json',
        },
        tsconfigRootDir: import.meta.dirname,
      },
      globals: { ...globals.node },
    },
  },
  {
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
  },
);
