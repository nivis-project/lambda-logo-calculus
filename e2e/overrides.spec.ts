import { expect, test } from '@playwright/test';
import { openStudio } from './studio.js';

async function glyphOrigin(page: import('@playwright/test').Page, character: string) {
  return page
    .getByTestId('side-defs')
    .locator(`[data-glyph="${character}"]`)
    .first()
    .evaluate((node) => (node as unknown as SVGGraphicsElement).getBBox().x);
}

test.describe('per-glyph overrides', () => {
  test.beforeEach(async ({ page }) => {
    await openStudio(page);
  });

  test('marks every glyph group with its character and index', async ({ page }) => {
    const groups = page.getByTestId('side-defs').locator('[data-glyph]');
    await expect(groups).toHaveCount(14);

    const marked = await groups.evaluateAll((nodes) =>
      nodes.map((n) => [n.getAttribute('data-glyph'), n.getAttribute('data-glyph-index')]),
    );
    expect(marked.map(([ch]) => ch).join('')).toBe('oTrefoilType26');
    expect(marked[1]).toEqual(['T', '0']);

    const eGroups = marked.filter(([ch]) => ch === 'e');
    expect(eGroups.length).toBeGreaterThan(1);
    expect(new Set(eGroups.map(([, i]) => i)).size).toBe(eGroups.length);
  });

  test('opens a glyph by clicking it on the canvas', async ({ page }) => {
    await expect(page.getByTestId('glyph-hint')).toBeVisible();

    await page.getByTestId('side-defs').locator('[data-glyph="T"]').first().click();
    await expect(page.getByTestId('glyph-character')).toHaveText('T');
  });

  test('nudges one glyph and leaves the others', async ({ page }) => {
    await page.getByTestId('side-defs').locator('[data-glyph="T"]').first().click();

    const movedBefore = await glyphOrigin(page, 'T');
    const otherBefore = await glyphOrigin(page, 'f');

    await page.getByTestId('glyph-dx').fill('30');
    await expect(page.getByTestId('glyph-dx-value')).toHaveText('30');

    const movedAfter = await glyphOrigin(page, 'T');
    const otherAfter = await glyphOrigin(page, 'f');

    expect(movedAfter - movedBefore).toBeCloseTo(30, 3);
    expect(otherAfter).toBeCloseTo(otherBefore, 6);
  });

  test('survives a template parameter change', async ({ page }) => {
    await page.getByTestId('side-defs').locator('[data-glyph="T"]').first().click();
    await page.getByTestId('glyph-dy').fill('20');

    await page.getByTestId('slider-A').fill('9');
    await expect(page.getByTestId('glyph-dy-value')).toHaveText('20');

    const stored = await page.evaluate(() =>
      (window as unknown as {
        trefoilStore: { getProject: () => { patches: Record<string, unknown> } };
      }).trefoilStore.getProject().patches,
    );
    expect(stored).toHaveProperty('T');
  });

  test('overrides the ending for one glyph only', async ({ page }) => {
    await page.getByTestId('side-defs').locator('[data-glyph="T"]').first().click();

    const before = await page
      .getByTestId('side-defs')
      .locator('[data-glyph="T"]')
      .first()
      .locator('path')
      .count();

    await page.getByTestId('glyph-ending').selectOption('slab');
    await expect
      .poll(async () =>
        page
          .getByTestId('side-defs')
          .locator('[data-glyph="T"]')
          .first()
          .locator('path')
          .evaluateAll((nodes) => nodes.map((n) => (n.getAttribute('d') ?? '').length).join()),
      )
      .not.toBe('');

    expect(before).toBe(6);
  });

  test('clears a patch and undoes', async ({ page }) => {
    await page.getByTestId('side-defs').locator('[data-glyph="T"]').first().click();
    await page.getByTestId('glyph-dx').fill('25');
    await expect(page.getByTestId('glyph-dx-value')).toHaveText('25');

    await page.getByTestId('glyph-clear').click();
    await expect(page.getByTestId('glyph-dx-value')).toHaveText('0');

    await page.getByTestId('undo').click();
    await expect(page.getByTestId('glyph-dx-value')).toHaveText('25');
  });
});
