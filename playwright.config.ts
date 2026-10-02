import { defineConfig } from '@playwright/test';

const PORT = 4173;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: { baseURL: `http://127.0.0.1:${String(PORT)}`, trace: 'retain-on-failure' },
  // Build before serving, so the suite always tests the working tree rather
  // than whatever was built last.
  webServer: {
    command: `pnpm build && pnpm --filter @trefoil/studio preview --port ${String(PORT)} --strictPort`,
    url: `http://127.0.0.1:${String(PORT)}`,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
