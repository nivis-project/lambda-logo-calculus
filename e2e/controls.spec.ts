import { expect, test } from '@playwright/test';

test.describe('controls generated from the parameter definitions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('stage').locator('svg').waitFor();
  });

  test('shows one control for every declared parameter', async ({ page }) => {
    for (const id of ['A', 'copies', 'rotation', 'fit', 'alpha', 'markSize']) {
      await expect(page.getByTestId(`slider-${id}`)).toBeVisible();
    }
    await expect(page.getByTestId('select-paletteId')).toBeVisible();
    await expect(page.getByTestId('select-endingId')).toBeVisible();
    await expect(page.getByTestId('check-markOn')).toBeVisible();
  });

  test('takes its bounds and its step from the declaration', async ({ page }) => {
    const copies = page.getByTestId('slider-copies');
    await expect(copies).toHaveAttribute('min', '1');
    await expect(copies).toHaveAttribute('max', '12');
    await expect(copies).toHaveAttribute('step', '1');

    const alpha = page.getByTestId('slider-alpha');
    await expect(alpha).toHaveAttribute('min', '0.05');
    await expect(alpha).toHaveAttribute('max', '0.6');
    await expect(alpha).toHaveAttribute('step', '0.01');
  });

  test('a slider shows its value and redraws the logo', async ({ page }) => {
    await expect(page.getByTestId('value-copies')).toHaveText('6');

    const before = await page.getByTestId('stage').innerHTML();
    await page.getByTestId('slider-copies').fill('9');

    await expect(page.getByTestId('value-copies')).toHaveText('9');
    await expect.poll(async () => page.getByTestId('stage').innerHTML()).not.toBe(before);
  });

  test('reset puts a parameter back to its declared default', async ({ page }) => {
    await page.getByTestId('slider-rotation').fill('90');
    await expect(page.getByTestId('value-rotation')).toHaveText('90.0°');

    await page.getByTestId('reset-rotation').click();
    await expect(page.getByTestId('value-rotation')).toHaveText('24.0°');
    await expect(page.getByTestId('slider-rotation')).toHaveValue('24');
  });

  test('randomize moves an unlocked parameter and leaves a locked one alone', async ({ page }) => {
    await page.getByTestId('lock-copies').check();

    const copies = await page.getByTestId('value-copies').textContent();
    const rotation = await page.getByTestId('value-rotation').textContent();

    await page.getByTestId('randomize').click();

    await expect(page.getByTestId('value-copies')).toHaveText(copies ?? '');
    await expect.poll(async () => page.getByTestId('value-rotation').textContent()).not.toBe(rotation);
  });

  test('advanced controls stay out of the way until they are asked for', async ({ page }) => {
    const advanced = page.locator('.control.advanced').first();
    if ((await page.locator('.control.advanced').count()) === 0) test.skip();

    await expect(advanced).toBeHidden();
    await page.getByTestId('show-advanced').check();
    await expect(advanced).toBeVisible();
  });

  test('a stage switch changes the drawing', async ({ page }) => {
    const before = await page.getByTestId('stage').innerHTML();
    await page.getByTestId('stage-bowls').uncheck();
    await expect.poll(async () => page.getByTestId('stage').innerHTML()).not.toBe(before);
  });

  test('a stage owns its own parameters, named apart from another stage', async ({ page }) => {
    await page.getByTestId('show-advanced').check();
    await expect(page.getByTestId('slider-bowls.minFactor')).toBeVisible();
    await expect(page.getByTestId('slider-curves.minFactor')).toBeVisible();

    const before = await page.getByTestId('stage').innerHTML();
    await page.getByTestId('slider-bowls.inset').fill('14');
    await expect(page.getByTestId('value-bowls.inset')).toHaveText('14.0');
    await expect.poll(async () => page.getByTestId('stage').innerHTML()).not.toBe(before);
  });

  test('a mark control moves the mark', async ({ page }) => {
    const before = await page.getByTestId('stage').innerHTML();
    await page.getByTestId('slider-markSize').fill('1.6');
    await expect.poll(async () => page.getByTestId('stage').innerHTML()).not.toBe(before);

    await page.getByTestId('check-markOn').uncheck();
    await expect(page.getByTestId('placement')).toHaveText(/^none, /);
  });
});
