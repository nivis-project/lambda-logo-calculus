import { expect, test } from '@playwright/test';

test.describe('the studio shell', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('stage').locator('svg').waitFor();
  });

  test('draws the logo when the page opens', async ({ page }) => {
    await expect(page).toHaveTitle('Trefoil Studio');

    const paths = page.getByTestId('stage').locator('path');
    await expect(paths.first()).toBeVisible();
    expect(await paths.count()).toBeGreaterThan(10);

    const d = await paths.first().getAttribute('d');
    expect(d).toMatch(/^M-?\d/);
    expect(d).not.toContain('NaN');
  });

  test('draws the mark beside the letters, and says how it laid out', async ({ page }) => {
    // Two lines at this width is what the prototype does too: the mark reserves
    // a third of the width and the default text does not fit beside it on one.
    await expect(page.getByTestId('placement')).toHaveText(/^side, \d lines?$/);

    await page.getByTestId('text-input').fill('Hi');
    await expect(page.getByTestId('placement')).toHaveText('side, 1 line');
  });

  test('redraws when the text changes', async ({ page }) => {
    const before = await page.getByTestId('stage').innerHTML();

    await page.getByTestId('text-input').fill('Hamburg');
    await expect.poll(async () => page.getByTestId('stage').innerHTML()).not.toBe(before);

    const after = await page.getByTestId('stage').locator('path').count();
    expect(after).toBeGreaterThan(0);
  });

  test('prompts instead of drawing nothing when the text is emptied', async ({ page }) => {
    await page.getByTestId('text-input').fill('');
    await expect(page.getByTestId('empty')).toBeVisible();
    await expect(page.getByTestId('stage').locator('svg')).toHaveCount(0);

    await page.getByTestId('text-input').fill('o');
    await expect(page.getByTestId('stage').locator('svg')).toHaveCount(1);
  });
});
