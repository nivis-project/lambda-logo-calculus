import { expect, test } from '@playwright/test';
import { openStudio } from './studio.js';

async function shapeHash(page: import('@playwright/test').Page): Promise<number> {
  return page
    .getByTestId('side-defs')
    .locator('path')
    .evaluateAll((nodes) => {
      const joined = nodes.map((n) => n.getAttribute('d') ?? '').join('|');
      let hash = joined.length;
      for (let i = 0; i < joined.length; i++) hash = (hash * 31 + joined.charCodeAt(i)) | 0;
      return hash;
    });
}

test.describe('the modulation list', () => {
  test.beforeEach(async ({ page }) => {
    await openStudio(page);
  });

  test('ships the prototype links as the default preset', async ({ page }) => {
    await expect(page.getByTestId('modulation-amplitude-to-width')).toBeVisible();
    await expect(page.getByTestId('modulation-fit-to-x-height')).toBeVisible();

    await expect(page.getByTestId('modulation-source-amplitude-to-width')).toHaveValue('param:A');
    await expect(page.getByTestId('modulation-target-amplitude-to-width')).toHaveValue('widthFactor');
    await expect(page.getByTestId('modulation-response-amplitude-to-width')).toHaveValue(
      'prototypeWidth',
    );
  });

  test('removing the amplitude link stops the amplitude widening the letters', async ({ page }) => {
    await page.getByTestId('slider-A').fill('18');
    const widened = await shapeHash(page);

    await page.getByTestId('modulation-remove-amplitude-to-width').click();
    await expect.poll(() => shapeHash(page)).not.toBe(widened);
    await expect(page.getByTestId('modulation-amplitude-to-width')).toHaveCount(0);

    const unmodulated = await shapeHash(page);
    await page.getByTestId('slider-A').fill('4');
    await page.getByTestId('slider-A').fill('18');
    await expect.poll(() => shapeHash(page)).toBe(unmodulated);
  });

  test('removing a link can be undone', async ({ page }) => {
    await page.getByTestId('modulation-remove-fit-to-x-height').click();
    await expect(page.getByTestId('modulation-fit-to-x-height')).toHaveCount(0);

    await page.getByTestId('undo').click();
    await expect(page.getByTestId('modulation-fit-to-x-height')).toBeVisible();
  });

  test('setting an amount to zero leaves the target alone', async ({ page }) => {
    await page.getByTestId('slider-A').fill('18');
    const driven = await shapeHash(page);

    await page.getByTestId('modulation-amount-amplitude-to-width').fill('0');
    await expect(page.getByTestId('modulation-amount-value-amplitude-to-width')).toHaveText('0');
    await expect.poll(() => shapeHash(page)).not.toBe(driven);
  });

  test('retargets a link', async ({ page }) => {
    const before = await shapeHash(page);
    await page.getByTestId('modulation-target-amplitude-to-width').selectOption('bend.factor');
    await expect(page.getByTestId('modulation-target-amplitude-to-width')).toHaveValue('bend.factor');
    await expect.poll(() => shapeHash(page)).not.toBe(before);
  });

  test('adds a new link', async ({ page }) => {
    const before = await shapeHash(page);
    await page.getByTestId('modulation-add').click();
    await expect(page.getByTestId('modulation-entry-3')).toBeVisible();
    await expect(page.getByTestId('modulation-source-entry-3')).toHaveValue('charPosition');
    await expect.poll(() => shapeHash(page)).not.toBe(before);

    await page.getByTestId('undo').click();
    await expect(page.getByTestId('modulation-entry-3')).toHaveCount(0);
  });
});
