import type { Page } from '@playwright/test';

export async function openStudio(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.clear();
  });
  await page.goto('/');
  await page.getByTestId('mark-defs').locator('[data-glyph]').first().waitFor();
  await page.getByTestId('side-defs').locator('[data-glyph]').first().waitFor();
}
