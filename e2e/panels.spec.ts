import { expect, test } from '@playwright/test';

test.describe('generated parameter panels', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { window.localStorage.clear(); });
    await page.goto('/');
    await page.getByTestId('artboard-mark').locator('svg').waitFor();
  });

  test('renders the control each kind calls for', async ({ page }) => {
    await expect(page.getByTestId('slider-A')).toHaveAttribute('type', 'range');
    await expect(page.getByTestId('slider-copies')).toHaveAttribute('type', 'range');
    await expect(page.getByTestId('select-ending')).toBeVisible();
    await expect(page.getByTestId('checkbox-shapePen')).toHaveAttribute('type', 'checkbox');

    await expect(page.getByTestId('control-A')).toHaveAttribute('data-kind', 'number');
    await expect(page.getByTestId('control-copies')).toHaveAttribute('data-kind', 'int');
    await expect(page.getByTestId('control-rotation')).toHaveAttribute('data-kind', 'angle');
    await expect(page.getByTestId('control-ending')).toHaveAttribute('data-kind', 'enum');
    await expect(page.getByTestId('control-shapePen')).toHaveAttribute('data-kind', 'bool');
  });

  test('takes its range from the definition', async ({ page }) => {
    const slider = page.getByTestId('slider-A');
    await expect(slider).toHaveAttribute('min', '1');
    await expect(slider).toHaveAttribute('max', '20');
    await expect(page.getByTestId('slider-copies')).toHaveAttribute('max', '12');
  });

  test('shows the value, locks and resets', async ({ page }) => {
    await expect(page.getByTestId('value-copies')).toHaveText('6');

    await page.getByTestId('slider-copies').fill('3');
    await expect(page.getByTestId('value-copies')).toHaveText('3');

    await page.getByTestId('lock-copies').click();
    await expect(page.getByTestId('lock-copies')).toHaveAttribute('aria-pressed', 'true');
    expect(
      await page.evaluate(() =>
        (window as unknown as { trefoilStore: { getProject: () => { locked: string[] } } })
          .trefoilStore.getProject().locked,
      ),
    ).toContain('copies');

    await page.getByTestId('lock-copies').click();
    expect(
      await page.evaluate(() =>
        (window as unknown as { trefoilStore: { getProject: () => { locked: string[] } } })
          .trefoilStore.getProject().locked,
      ),
    ).not.toContain('copies');

    await page.getByTestId('reset-copies').click();
    await expect(page.getByTestId('value-copies')).toHaveText('6');

    await page.getByTestId('undo').click();
    await expect(page.getByTestId('value-copies')).toHaveText('3');
  });

  test('accepts an exact typed value and clamps one out of range', async ({ page }) => {
    await page.getByTestId('slider-A').dblclick();
    await page.getByTestId('exact-A').fill('7.25');
    await page.getByTestId('exact-A').press('Enter');
    await expect(page.getByTestId('value-A')).toHaveText('7.25');

    await page.getByTestId('slider-A').dblclick();
    await page.getByTestId('exact-A').fill('500');
    await page.getByTestId('exact-A').press('Enter');
    await expect(page.getByTestId('value-A')).toHaveText('20');
    await expect(page.getByTestId('clamped-A')).toBeVisible();
  });

  test('groups controls and hides the advanced ones', async ({ page }) => {
    await expect(page.getByTestId('group-Shape')).toBeVisible();
    await expect(page.getByTestId('group-Nesting')).toBeVisible();

    await page.getByTestId('stage-expand-bowls').click();
    await expect(page.getByTestId('control-inset')).toHaveCount(0);

    await page.getByTestId('advanced-stage-params-bowls').click();
    await expect(page.getByTestId('control-inset')).toBeVisible();
    await expect(page.getByTestId('value-inset')).toHaveText('5');
  });

  test('switches, reorders and edits stages', async ({ page }) => {
    const firstPath = page.getByTestId('wordmark-defs').locator('path').first();
    const before = await firstPath.getAttribute('d');

    await page.getByTestId('stage-enabled-bend').uncheck();
    await expect(firstPath).not.toHaveAttribute('d', before ?? '');

    await page.getByTestId('undo').click();
    await expect(firstPath).toHaveAttribute('d', before ?? '');

    const order = async (): Promise<string[]> =>
      page.getByTestId('stage-list').locator('li').evaluateAll((nodes) =>
        nodes.map((n) => n.getAttribute('data-testid') ?? ''),
      );
    expect(await order()).toEqual([
      'stage-curves',
      'stage-bowls',
      'stage-bend',
      'stage-proportions',
      'stage-split',
    ]);

    await page.getByTestId('stage-down-curves').click();
    expect((await order())[0]).toBe('stage-bowls');

    await page.getByTestId('undo').click();
    expect((await order())[0]).toBe('stage-curves');
  });

  test('shows a gallery that follows the project and switches template', async ({ page }) => {
    await expect(page.getByTestId('gallery').locator('button')).toHaveCount(5);
    for (const id of ['trefoil', 'rose', 'superellipse', 'supershape', 'rounded-polygon']) {
      await expect(page.getByTestId(`template-${id}`)).toBeVisible();
    }

    const before = await page.getByTestId('thumb-rose').getAttribute('src');
    await page.getByTestId('slider-copies').fill('2');
    await expect(page.getByTestId('thumb-rose')).not.toHaveAttribute('src', before ?? '');

    await page.getByTestId('template-rose').click();
    await expect(page.getByTestId('template-rose')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('control-k')).toBeVisible();
    await expect(page.getByTestId('value-k')).toHaveText('5');

    await page.getByTestId('undo').click();
    await expect(page.getByTestId('template-trefoil')).toHaveAttribute('aria-pressed', 'true');
  });
});
