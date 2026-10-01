import { expect, test } from '@playwright/test';

test('the studio renders the wordmark from the ported pipeline', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('Trefoil Studio');

  const status = page.locator('#status');
  await expect(status).toContainText('Templates registered: 1');
  await expect(status).toContainText('perfectFit: 0.6');
  await expect(status).toContainText('Copies: 6');
  await expect(status).toContainText('Glyph groups: 13');

  const svg = page.locator('#canvas svg');
  await expect(svg).toHaveCount(1);

  const paths = page.locator('#canvas svg path');
  await expect(paths).toHaveCount(13 * 6);

  const firstPathData = await paths.first().getAttribute('d');
  expect(firstPathData).toMatch(/^M-?\d/);
  expect(firstPathData).not.toContain('NaN');

  const box = await svg.boundingBox();
  expect(box?.width ?? 0).toBeGreaterThan(100);
});
