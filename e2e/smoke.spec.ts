import { expect, test } from '@playwright/test';

test('the studio renders the wordmark from the store', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('Trefoil Studio');

  const status = page.locator('#status');
  await expect(status).toContainText('Templates registered: 5');
  await expect(status).toContainText('Template: trefoil');
  await expect(status).toContainText('Copies: 6');
  await expect(status).toContainText('Glyph groups: 13');
  await expect(status).toContainText('Undo: no');

  const paths = page.locator('#canvas svg path');
  await expect(paths).toHaveCount(13 * 6);

  const firstPathData = await paths.first().getAttribute('d');
  expect(firstPathData).toMatch(/^M-?\d/);
  expect(firstPathData).not.toContain('NaN');
});

test('a command redraws the wordmark and can be undone', async ({ page }) => {
  await page.goto('/');
  await page.locator('#canvas svg').waitFor();

  await page.evaluate(() => {
    const store = (window as unknown as { trefoilStore: { dispatch: (c: unknown) => void } })
      .trefoilStore;
    store.dispatch({ kind: 'setNumber', field: 'copies', value: 3 });
  });

  await expect(page.locator('#status')).toContainText('Copies: 3');
  await expect(page.locator('#status')).toContainText('Undo: yes');
  await expect(page.locator('#canvas svg path')).toHaveCount(13 * 3);

  await page.evaluate(() => {
    (window as unknown as { trefoilStore: { undo: () => void } }).trefoilStore.undo();
  });

  await expect(page.locator('#status')).toContainText('Copies: 6');
  await expect(page.locator('#canvas svg path')).toHaveCount(13 * 6);
});
