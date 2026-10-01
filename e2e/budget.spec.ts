import { expect, test } from '@playwright/test';
import { openStudio } from './studio.js';

test.describe('rendering', () => {
  test.beforeEach(async ({ page }) => {
    await openStudio(page);
  });

  test('reports how long the last render took, and at which quality', async ({ page }) => {
    await expect(page.getByTestId('render-quality')).toHaveText('full');
    await expect
      .poll(async () => Number(await page.getByTestId('render-ms').innerText()))
      .toBeGreaterThan(0);
  });

  test('draws draft while a slider is held and full when it is let go', async ({ page }) => {
    const slider = page.getByTestId('slider-A');
    const box = await slider.boundingBox();
    if (box === null) throw new Error('no slider');

    await page.mouse.move(box.x + box.width * 0.3, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.7, box.y + box.height / 2, { steps: 6 });
    await expect(page.getByTestId('render-quality')).toHaveText('draft');

    await page.mouse.up();
    await expect(page.getByTestId('render-quality')).toHaveText('full');
  });

  test('stays responsive while it renders, and draws the newest', async ({ page }) => {
    await page.getByTestId('slider-A').fill('4');
    await page.getByTestId('slider-A').fill('6');
    await page.getByTestId('slider-A').fill('8');

    await expect(page.getByTestId('value-A')).toHaveText('8');
    await page.getByTestId('zoom-in').click();
    await expect(page.getByTestId('zoom-level')).toHaveText('1.25');

    await expect
      .poll(async () => page.getByTestId('side-defs').locator('[data-glyph]').count())
      .toBeGreaterThan(0);
  });

  test('builds its scenes off the painting thread', async ({ page }) => {
    await expect.poll(() => page.workers().length).toBeGreaterThan(0);
    const workers = page.workers();
    expect(workers.length).toBeGreaterThan(0);
    expect(workers.some((worker) => worker.url().includes('scenes.worker'))).toBe(true);
  });
});
