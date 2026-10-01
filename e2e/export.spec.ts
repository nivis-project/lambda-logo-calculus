import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { openStudio } from './studio.js';

const FIT_TOLERANCE = 0.2;
const ROUNDING = 0.005;
const SAMPLING = 0.095;
const MATCH = FIT_TOLERANCE + ROUNDING + SAMPLING;

interface Box {
  readonly x0: number;
  readonly y0: number;
  readonly x1: number;
  readonly y1: number;
}

interface Measured {
  readonly viewBox: string;
  readonly glyphs: readonly { readonly character: string | null; readonly index: string | null; readonly box: Box }[];
  readonly paints: readonly { readonly fill: string | null; readonly opacity: string | null }[];
}

const READ = (host: Element): Measured => {
  const sampled = (path: SVGPathElement): Box => {
    const total = path.getTotalLength();
    const steps = Math.min(400, Math.max(32, Math.round(total / 2)));
    let x0 = Number.POSITIVE_INFINITY;
    let y0 = Number.POSITIVE_INFINITY;
    let x1 = Number.NEGATIVE_INFINITY;
    let y1 = Number.NEGATIVE_INFINITY;
    for (let i = 0; i <= steps; i++) {
      const point = path.getPointAtLength((total * i) / steps);
      x0 = Math.min(x0, point.x);
      y0 = Math.min(y0, point.y);
      x1 = Math.max(x1, point.x);
      y1 = Math.max(y1, point.y);
    }
    return { x0, y0, x1, y1 };
  };

  const union = (boxes: readonly Box[]): Box =>
    boxes.reduce(
      (all, box) => ({
        x0: Math.min(all.x0, box.x0),
        y0: Math.min(all.y0, box.y0),
        x1: Math.max(all.x1, box.x1),
        y1: Math.max(all.y1, box.y1),
      }),
      { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity },
    );

  return {
    viewBox: host.querySelector('svg')?.getAttribute('viewBox') ?? '',
    glyphs: [...host.querySelectorAll('[data-glyph]')].map((group) => ({
      character: group.getAttribute('data-glyph'),
      index: group.getAttribute('data-glyph-index'),
      box: union([...group.querySelectorAll('path')].map(sampled)),
    })),
    paints: [...host.querySelectorAll('path')].map((path) => ({
      fill: path.getAttribute('fill'),
      opacity: path.getAttribute('opacity'),
    })),
  };
};

test.describe('exporting', () => {
  test.beforeEach(async ({ page }) => {
    await openStudio(page);
  });

  test('shows the chosen exporter parameters and no others', async ({ page }) => {
    await expect(page.getByTestId('export-params-svg')).toBeVisible();
    await expect(page.getByTestId('slider-decimals')).toBeVisible();
    await expect(page.getByTestId('export-params-png')).toHaveCount(0);

    await page.getByTestId('export-format').selectOption('png');
    await expect(page.getByTestId('export-params-png')).toBeVisible();
    await expect(page.getByTestId('export-params-svg')).toHaveCount(0);
    await expect(page.getByTestId('select-scale')).toBeVisible();

    await page.getByTestId('export-format').selectOption('pdf');
    await expect(page.getByTestId('export-params-pdf')).toBeVisible();
    await expect(page.getByTestId('slider-pageScale')).toBeVisible();
  });

  test('writes a file for each of the three formats', async ({ page }) => {
    for (const [format, head] of [
      ['svg', '<svg'],
      ['pdf', '%PDF'],
    ] as const) {
      await page.getByTestId('export-format').selectOption(format);
      const waiting = page.waitForEvent('download');
      await page.getByTestId('export-run').click();
      const file = await waiting;
      expect(file.suggestedFilename()).toBe(`trefoil-type-26.${format}`);
      expect(await readFile(await file.path(), 'utf8')).toContain(head);
    }

    await page.getByTestId('export-format').selectOption('png');
    const waiting = page.waitForEvent('download');
    await page.getByTestId('export-run').click();
    const png = await waiting;
    expect(png.suggestedFilename()).toBe('trefoil-type-26.png');
    const bytes = await readFile(await png.path());
    expect([...bytes.subarray(0, 4)]).toEqual([137, 80, 78, 71]);
  });

  test('says what went wrong and keeps the project when an export fails', async ({ page }) => {
    await page.getByTestId('export-format').selectOption('png');
    await page.evaluate(() => {
      HTMLCanvasElement.prototype.getContext = () => null;
    });

    await page.getByTestId('export-run').click();
    await expect(page.getByTestId('export-report')).toBeVisible();
    await expect(page.getByTestId('export-report')).toContainText('2d canvas context');
    await expect(page.getByTestId('text-input')).toHaveValue('Trefoil Type 26');
  });

  test('the exported SVG matches what is on screen', async ({ page }) => {
    const onScreen = await page.getByTestId('side-defs').evaluate(READ);

    const waiting = page.waitForEvent('download');
    await page.getByTestId('export-run').click();
    const exported = await readFile(await (await waiting).path(), 'utf8');

    await page.evaluate((text) => {
      const host = document.createElement('div');
      host.id = 'exported-host';
      host.style.position = 'absolute';
      host.style.left = '-10000px';
      host.innerHTML = text;
      document.body.append(host);
    }, exported);

    const read = await page.locator('#exported-host').evaluate(READ);

    expect(read.viewBox).toBe(onScreen.viewBox);
    expect(read.glyphs.map((glyph) => [glyph.character, glyph.index])).toEqual(
      onScreen.glyphs.map((glyph) => [glyph.character, glyph.index]),
    );
    expect(read.paints).toEqual(onScreen.paints);

    for (const [index, glyph] of read.glyphs.entries()) {
      const before = onScreen.glyphs[index]?.box;
      if (before === undefined) throw new Error('no glyph on screen');
      for (const edge of ['x0', 'y0', 'x1', 'y1'] as const) {
        expect(Math.abs(glyph.box[edge] - before[edge]), `${glyph.character ?? ''} ${edge}`).toBeLessThanOrEqual(
          MATCH,
        );
      }
    }
  });
});

test.describe('the brand sheet', () => {
  test.beforeEach(async ({ page }) => {
    await openStudio(page);
  });

  test('writes a sheet holding the mark, both lockups, the clear space and the palette', async ({
    page,
  }) => {
    await page.getByTestId('export-format').selectOption('brand-sheet');
    await expect(page.getByTestId('export-params-brand-sheet')).toBeVisible();

    const waiting = page.waitForEvent('download');
    await page.getByTestId('export-run').click();
    const file = await waiting;
    expect(file.suggestedFilename()).toBe('trefoil-type-26.sheet.svg');

    const sheet = await readFile(await file.path(), 'utf8');
    for (const heading of ['Mark', 'Clear space', 'Lockup, beside', 'Lockup, stacked', 'Palette']) {
      expect(sheet).toContain(`>${heading}</text>`);
    }
    expect(sheet).toContain('>Trefoil Type 26</text>');
    expect((sheet.match(/hsl\([^)]*\)<\/text>/g) ?? []).length).toBe(6);
  });
});
