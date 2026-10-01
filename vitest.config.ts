import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'node',
          include: [
            'packages/core/test/**/*.test.ts',
            'packages/templates/test/**/*.test.ts',
            'packages/store/test/**/*.test.ts',
            'packages/export/test/**/*.test.ts',
            'test/**/*.test.ts',
          ],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'dom',
          include: ['packages/render-svg/test/**/*.test.ts'],
          environment: 'happy-dom',
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: ['packages/*/src/**/*.ts'],
      exclude: ['**/dist/**', '**/*.d.ts'],
      thresholds: {
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70,
        'packages/core/src/**': {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
      },
    },
  },
});
