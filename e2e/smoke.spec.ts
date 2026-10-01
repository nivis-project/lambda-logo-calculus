import { expect, test } from '@playwright/test';

test('the studio loads and reports what the core gave it', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('Trefoil Studio');

  const app = page.locator('#app');
  await expect(app).toContainText('Trefoil Studio');
  await expect(app).toContainText('Templates registered: 1');
  await expect(app).toContainText('perfectFit: 0.6');
  await expect(app).toContainText('Viewbox: 0 0 1000 1000');
});
