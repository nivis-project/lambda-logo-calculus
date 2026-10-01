import { expect, test } from '@playwright/test';

test.describe('the studio shell', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await page.goto('/');
    await page.getByTestId('artboard-mark').locator('svg').waitFor();
  });

  test('lays the panels out around the canvas', async ({ page }) => {
    await expect(page.locator('.top-bar')).toBeVisible();
    await expect(page.getByTestId('panel-left')).toBeVisible();
    await expect(page.getByTestId('canvas')).toBeVisible();
    await expect(page.getByTestId('panel-right')).toBeVisible();
    await expect(page.getByTestId('bottom')).toBeVisible();

    const canvas = await page.getByTestId('canvas').boundingBox();
    const left = await page.getByTestId('panel-left').boundingBox();
    const right = await page.getByTestId('panel-right').boundingBox();
    expect(canvas?.width ?? 0).toBeGreaterThan(left?.width ?? 0);
    expect(canvas?.width ?? 0).toBeGreaterThan(right?.width ?? 0);
  });

  test('shows three labelled artboards that all redraw', async ({ page }) => {
    for (const [id, label] of [
      ['mark', 'Mark'],
      ['side', 'Horizontal lockup'],
      ['stacked', 'Stacked lockup'],
    ] as const) {
      await expect(page.getByTestId(`artboard-${id}`)).toContainText(label);
    }
    await expect(page.getByTestId('artboard-mark').locator('svg')).toHaveCount(1);
    await expect(page.getByTestId('artboard-side').locator('svg')).toHaveCount(1);
    await expect(page.getByTestId('artboard-stacked').locator('svg')).toHaveCount(1);

    const before = await page.getByTestId('side-defs').locator('path').count();
    await page.evaluate(() => {
      (window as unknown as { trefoilStore: { dispatch: (c: unknown) => void } }).trefoilStore.dispatch(
        { kind: 'setNumber', field: 'copies', value: 2 },
      );
    });
    const after = await page.getByTestId('side-defs').locator('path').count();
    expect(after).toBeLessThan(before);
    expect(await page.getByTestId('mark-defs').locator('path').count()).toBe(2);
  });

  test('zooms, bounds the zoom and resets', async ({ page }) => {
    await expect(page.getByTestId('zoom-level')).toHaveText('1.00');

    await page.getByTestId('zoom-in').click();
    await expect(page.getByTestId('zoom-level')).toHaveText('1.25');
    await page.getByTestId('zoom-out').click();
    await expect(page.getByTestId('zoom-level')).toHaveText('1.00');

    for (let i = 0; i < 20; i++) await page.getByTestId('zoom-in').click();
    await expect(page.getByTestId('zoom-level')).toHaveText('4.00');

    for (let i = 0; i < 40; i++) await page.getByTestId('zoom-out').click();
    await expect(page.getByTestId('zoom-level')).toHaveText('0.25');

    await page.getByTestId('reset-view').click();
    await expect(page.getByTestId('zoom-level')).toHaveText('1.00');
    await expect(page.getByTestId('artboards')).toHaveAttribute(
      'style',
      /translate\(0px, 0px\) scale\(1\)/,
    );
  });

  test('draws the grid overlay at the grid metrics and only when it is on', async ({ page }) => {
    const paths = page.getByTestId('side-defs').locator('path');
    const before = await paths.count();

    await page.getByTestId('overlay-grid').check();
    expect(await paths.count()).toBe(before + 4);

    await page.getByTestId('overlay-grid').uncheck();
    expect(await paths.count()).toBe(before);
  });

  test('switches overlays independently', async ({ page }) => {
    const paths = page.getByTestId('side-defs').locator('path');
    const base = await paths.count();

    await page.getByTestId('overlay-grid').check();
    const withGrid = await paths.count();
    await page.getByTestId('overlay-optical').check();
    const withBoth = await paths.count();

    expect(withGrid).toBeGreaterThan(base);
    expect(withBoth).toBeGreaterThan(withGrid);

    await page.getByTestId('overlay-grid').uncheck();
    expect(await paths.count()).toBe(withBoth - (withGrid - base));
  });

  test('the skeleton overlay follows the stage list', async ({ page }) => {
    const paths = page.getByTestId('side-defs').locator('path');
    await page.getByTestId('overlay-skeletons').check();
    const withBend = await paths.count();

    await page.evaluate(() => {
      (window as unknown as { trefoilStore: { dispatch: (c: unknown) => void } }).trefoilStore.dispatch(
        { kind: 'setStageEnabled', stageId: 'bend', enabled: false },
      );
    });

    expect(await paths.count()).not.toBe(withBend);
  });

  test('typing changes the wordmark and can be undone', async ({ page }) => {
    const input = page.getByTestId('text-input');
    await input.fill('Hi');
    await expect(page.getByTestId('side-defs').locator('path')).toHaveCount(2 * 6 + 6);

    await page.getByTestId('undo').click();
    await expect(input).not.toHaveValue('Hi');
  });

  test('shows the small sizes on light and dark', async ({ page }) => {
    for (const size of [16, 32, 64, 128]) {
      for (const tone of ['light', 'dark']) {
        await expect(page.getByTestId(`size-${size}-${tone}`)).toBeVisible();
      }
    }
    const sample = page.getByTestId('size-64-light').locator('img');
    await expect(sample).toHaveAttribute('height', '64');
    await expect(sample).toHaveAttribute('src', /^data:image\/svg\+xml/);
  });

  test('undo and redo are disabled when there is nothing to do', async ({ page }) => {
    await expect(page.getByTestId('undo')).toBeDisabled();
    await expect(page.getByTestId('redo')).toBeDisabled();

    await page.getByTestId('text-input').fill('Edited');
    await expect(page.getByTestId('undo')).toBeEnabled();
    await expect(page.getByTestId('redo')).toBeDisabled();

    await page.getByTestId('undo').click();
    await expect(page.getByTestId('redo')).toBeEnabled();
  });

  test('undo and redo from the keyboard, but not while typing', async ({ page }) => {
    await page.getByTestId('text-input').fill('Keyboard');
    await page.getByTestId('canvas').click();

    await page.keyboard.press('Control+z');
    await expect(page.getByTestId('text-input')).not.toHaveValue('Keyboard');

    await page.keyboard.press('Control+Shift+z');
    await expect(page.getByTestId('text-input')).toHaveValue('Keyboard');

    await page.getByTestId('text-input').click();
    await page.keyboard.press('0');
    await expect(page.getByTestId('text-input')).toHaveValue('Keyboard0');
    await expect(page.getByTestId('zoom-level')).toHaveText('1.00');
  });

  test('zooms and toggles overlays from the keyboard', async ({ page }) => {
    await page.getByTestId('canvas').click();

    await page.keyboard.press('+');
    await expect(page.getByTestId('zoom-level')).toHaveText('1.25');
    await page.keyboard.press('0');
    await expect(page.getByTestId('zoom-level')).toHaveText('1.00');

    await page.keyboard.press('1');
    await expect(page.getByTestId('overlay-grid')).toBeChecked();
  });
});
