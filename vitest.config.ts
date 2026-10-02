import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['packages/*/test/**/*.test.ts'],
    environment: 'node',
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
