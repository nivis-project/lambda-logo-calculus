import { expect, test } from '@playwright/test';

test.describe('randomize and variants', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { window.localStorage.clear(); });
    await page.goto('/');
    await page.getByTestId('artboard-mark').locator('svg').waitFor();
  });

  test('redraws the wordmark and is undone by one press', async ({ page }) => {
    const first = await page.getByTestId('side-defs').locator('path').first().getAttribute('d');
    const before = await page.getByTestId('value-copies').textContent();

    await page.getByTestId('randomize').click();
    await expect(page.getByTestId('side-defs').locator('path').first()).not.toHaveAttribute(
      'd',
      first ?? '',
    );

    await page.getByTestId('undo').click();
    await expect(page.getByTestId('value-copies')).toHaveText(before ?? '');
    await expect(page.getByTestId('side-defs').locator('path').first()).toHaveAttribute(
      'd',
      first ?? '',
    );
  });

  test('never moves a locked parameter', async ({ page }) => {
    await page.getByTestId('slider-copies').fill('4');
    await page.getByTestId('lock-copies').click();
    await page.getByTestId('slider-A').fill('9');
    await page.getByTestId('lock-A').click();

    for (let i = 0; i < 5; i++) {
      await page.getByTestId('randomize').click();
      await expect(page.getByTestId('value-copies')).toHaveText('4');
      await expect(page.getByTestId('value-A')).toHaveText('9');
    }
  });

  test('moves an unlocked parameter and advances the seed', async ({ page }) => {
    const seen = new Set<string>();
    for (let i = 0; i < 6; i++) {
      await page.getByTestId('randomize').click();
      seen.add((await page.getByTestId('value-rotation').textContent()) ?? '');
    }
    expect(seen.size).toBeGreaterThan(1);

    const seed = await page.evaluate(() =>
      (window as unknown as { trefoilStore: { getProject: () => { seed: string } } })
        .trefoilStore.getProject().seed,
    );
    expect(seed).not.toBe('trefoil');
  });

  test('keeps every result in the variant strip', async ({ page }) => {
    await expect(page.getByTestId('variants').locator('figure')).toHaveCount(0);

    for (let i = 0; i < 3; i++) await page.getByTestId('randomize').click();
    await expect(page.getByTestId('variants').locator('figure')).toHaveCount(3);

    for (const name of ['random-1', 'random-2', 'random-3']) {
      await expect(page.getByTestId(`variant-${name}`)).toBeVisible();
      await expect(page.getByTestId(`variant-${name}`).locator('img')).toHaveAttribute(
        'src',
        /^data:image\/svg\+xml/,
      );
    }
  });

  test('restores a variant and lets that be undone', async ({ page }) => {
    await page.getByTestId('randomize').click();
    const kept = await page.getByTestId('value-rotation').textContent();

    await page.getByTestId('randomize').click();
    await page.getByTestId('randomize').click();
    const latest = await page.getByTestId('value-rotation').textContent();

    await page.getByTestId('restore-random-1').click();
    await expect(page.getByTestId('value-rotation')).toHaveText(kept ?? '');

    await page.getByTestId('undo').click();
    await expect(page.getByTestId('value-rotation')).toHaveText(latest ?? '');
  });

  test('keeps a variant by hand and removes one', async ({ page }) => {
    await page.getByTestId('take-variant').click();
    await expect(page.getByTestId('variant-kept-1')).toBeVisible();

    await page.getByTestId('randomize').click();
    await expect(page.getByTestId('variants').locator('figure')).toHaveCount(2);

    await page.getByTestId('remove-kept-1').click();
    await expect(page.getByTestId('variant-kept-1')).toHaveCount(0);
    await expect(page.getByTestId('variants').locator('figure')).toHaveCount(1);
  });
});
