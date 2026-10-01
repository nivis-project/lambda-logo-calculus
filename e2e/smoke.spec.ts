import { expect, test } from '@playwright/test';
import { openStudio } from './studio.js';

test('the studio renders the wordmark from the store', async ({ page }) => {
  await openStudio(page);
  await expect(page).toHaveTitle('Trefoil Studio');

  const paths = page.getByTestId('side-defs').locator('path');
  await expect(paths).toHaveCount(13 * 6 + 6);

  const firstPathData = await paths.first().getAttribute('d');
  expect(firstPathData).toMatch(/^M-?\d/);
  expect(firstPathData).not.toContain('NaN');

  await expect(page.getByTestId('template-name')).toHaveText('trefoil');
  await expect(page.getByTestId('copies-count')).toHaveText('6');
});

test('a command redraws the wordmark and can be undone', async ({ page }) => {
  await openStudio(page);

  await page.evaluate(() => {
    (window as unknown as { trefoilStore: { dispatch: (c: unknown) => void } }).trefoilStore.dispatch(
      { kind: 'setNumber', field: 'copies', value: 3 },
    );
  });

  await expect(page.getByTestId('copies-count')).toHaveText('3');
  await expect(page.getByTestId('side-defs').locator('path')).toHaveCount(13 * 3 + 3);

  await page.evaluate(() => {
    (window as unknown as { trefoilStore: { undo: () => void } }).trefoilStore.undo();
  });

  await expect(page.getByTestId('copies-count')).toHaveText('6');
  await expect(page.getByTestId('side-defs').locator('path')).toHaveCount(13 * 6 + 6);
});

test('the two lockups place the mark differently', async ({ page }) => {
  await openStudio(page);

  const side = await page.getByTestId('artboard-side').locator('svg').getAttribute('viewBox');
  const stacked = await page.getByTestId('artboard-stacked').locator('svg').getAttribute('viewBox');
  expect(side).not.toBe(stacked);

  const widthOf = (box: string | null): number => Number(box?.split(' ')[2] ?? '0');
  const heightOf = (box: string | null): number => Number(box?.split(' ')[3] ?? '0');

  expect(widthOf(side)).toBeGreaterThan(widthOf(stacked));
  expect(heightOf(stacked)).toBeGreaterThan(heightOf(side));
});

test('the wordmark is drawn live once and previewed as an image elsewhere', async ({ page }) => {
  await openStudio(page);

  await expect(page.getByTestId('side-defs').locator('path')).toHaveCount(13 * 6 + 6);
  await expect(page.getByTestId('mark-defs').locator('path')).toHaveCount(6);

  await expect(page.locator('svg')).toHaveCount(3);
  await expect(page.locator('.size-sample img')).toHaveCount(8);
  await expect(page.locator('.size-sample svg')).toHaveCount(0);

  const sources = await page.locator('.size-sample img').evaluateAll((nodes) =>
    [...new Set(nodes.map((n) => (n as HTMLImageElement).getAttribute('src')))].length,
  );
  expect(sources).toBe(1);
});
