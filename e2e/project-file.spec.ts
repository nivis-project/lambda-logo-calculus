import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { expect, test } from '@playwright/test';
import { openStudio } from './studio.js';

async function sceneOf(page: import('@playwright/test').Page): Promise<string> {
  return page.getByTestId('side-defs').innerHTML();
}

test.describe('the project file', () => {
  test.beforeEach(async ({ page }) => {
    await openStudio(page);
  });

  test('saves the open project to a file', async ({ page }) => {
    await page.getByTestId('text-input').fill('Saved Logo');
    await expect(page.getByTestId('text-input')).toHaveValue('Saved Logo');

    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('file-save').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('saved-logo.trefoil.json');

    const path = await download.path();
    const held = JSON.parse(await readFile(path, 'utf8')) as {
      format: string;
      project: { text: string; version: number };
    };
    expect(held.format).toBe('trefoil-studio-project');
    expect(held.project.text).toBe('Saved Logo');
    expect(held.project.version).toBe(1);
  });

  test('opens a saved file, draws it, and one undo goes back', async ({ page }) => {
    await page.getByTestId('text-input').fill('Saved Logo');
    await page.getByTestId('slider-A').fill('7');
    await expect(page.getByTestId('value-A')).toHaveText('7');

    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('file-save').click();
    const saved = await (await downloadPromise).path();

    await page.getByTestId('text-input').fill('Something Else');
    await page.getByTestId('slider-A').fill('3');
    await expect(page.getByTestId('value-A')).toHaveText('3');
    const before = await sceneOf(page);

    await page.getByTestId('file-input').setInputFiles(saved);
    await expect(page.getByTestId('text-input')).toHaveValue('Saved Logo');
    await expect(page.getByTestId('value-A')).toHaveText('7');
    expect(await sceneOf(page)).not.toBe(before);

    await page.getByTestId('undo').click();
    await expect(page.getByTestId('text-input')).toHaveValue('Something Else');
    expect(await sceneOf(page)).toBe(before);
  });

  test('keeps the open project and reports what is wrong with a refused file', async ({ page }) => {
    await page.getByTestId('text-input').fill('Still Here');
    await expect(page.getByTestId('text-input')).toHaveValue('Still Here');
    const before = await sceneOf(page);

    const bad = join(tmpdir(), 'trefoil-bad-project.json');
    await writeFile(
      bad,
      JSON.stringify({ format: 'trefoil-studio-project', project: { version: 1, copies: 'six' } }),
      'utf8',
    );

    await page.getByTestId('file-input').setInputFiles(bad);
    await expect(page.getByTestId('file-report')).toBeVisible();
    await expect(page.getByTestId('file-report')).toContainText('copies: expected a number');

    await expect(page.getByTestId('text-input')).toHaveValue('Still Here');
    expect(await sceneOf(page)).toBe(before);
  });

  test('refuses a file from a newer version by name', async ({ page }) => {
    const future = join(tmpdir(), 'trefoil-future-project.json');
    const held = await page.evaluate(() =>
      (window as unknown as { trefoilStore: { getProject: () => unknown } }).trefoilStore.getProject(),
    );
    await writeFile(
      future,
      JSON.stringify({ format: 'trefoil-studio-project', project: { ...(held as object), version: 9 } }),
      'utf8',
    );

    await page.getByTestId('file-input').setInputFiles(future);
    await expect(page.getByTestId('file-report')).toContainText(
      'the file is version 9 and this studio reads version 1',
    );
  });
});
