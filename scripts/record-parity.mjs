#!/usr/bin/env node
import { chromium } from '@playwright/test';
import { writeFile, mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve, dirname } from 'node:path';

const PROTOTYPE = pathToFileURL(resolve('reference/trefoil-type.html')).href;
const OUT = resolve('test/parity/prototype-output.json');

const DEFAULTS = { A: 3, n: 6, rot: 24, fit: 0, text: 'l' };

const MATRIX = [
  DEFAULTS,
  { ...DEFAULTS, A: 1.5 },
  { ...DEFAULTS, A: 8 },
  { ...DEFAULTS, rot: 0 },
  { ...DEFAULTS, rot: 60 },
  { ...DEFAULTS, rot: 120 },
  { ...DEFAULTS, n: 1 },
  { ...DEFAULTS, n: 12 },
  { ...DEFAULTS, fit: 0.1 },
  { ...DEFAULTS, text: 'i' },
  { ...DEFAULTS, text: 'T' },
  { ...DEFAULTS, text: 'o' },
  { ...DEFAULTS, text: 'n' },
  { ...DEFAULTS, A: 6, rot: 40, n: 4, fit: 0.1 },
  { ...DEFAULTS, A: 12, rot: 90, n: 3, fit: -0.2 },
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const records = [];

for (const settings of MATRIX) {
  await page.goto(PROTOTYPE);
  await page.waitForSelector('#stage svg');

  await page.evaluate((s) => {
    const set = (id, value) => {
      const element = document.getElementById(id);
      if (element === null) throw new Error(`no control ${id}`);
      element.value = value;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    };
    const check = (name, on) => {
      const element = document.querySelector(`input[data-inf="${name}"]`);
      if (element === null) throw new Error(`no toggle ${name}`);
      if (element.checked !== on) element.click();
    };

    check('nib', false);
    check('ends', false);
    check('joins', false);
    set('end', 'flat');
    set('A', String(s.A));
    set('n', String(s.n));
    set('rot', String(s.rot));
    set('fit', String(s.fit));
    set('txt', s.text);
  }, settings);

  await page.waitForTimeout(150);

  const recorded = await page.evaluate(() => ({
    applied: {
      A: Number(document.getElementById('A').value),
      n: Number(document.getElementById('n').value),
      rot: Number(document.getElementById('rot').value),
      fit: Number(document.getElementById('fit').value),
      text: document.getElementById('txt').value,
    },
    perfectFit: document.getElementById('rpf').textContent ?? '',
    effectiveScale: document.getElementById('ref').textContent ?? '',
    widthFactor: document.getElementById('rsx').textContent ?? '',
    xHeight: document.getElementById('rxh').textContent ?? '',
    paths: Array.from(document.querySelectorAll('#stage svg path'), (p) => p.getAttribute('d') ?? ''),
  }));

  records.push({ requested: settings, ...recorded });
}

await browser.close();
await mkdir(dirname(OUT), { recursive: true });
await writeFile(
  OUT,
  `${JSON.stringify(
    {
      source: 'reference/trefoil-type.html',
      recordedBy: 'scripts/record-parity.mjs',
      settings: 'shape nib off, shape endings off, joins off, flat ending',
      records,
    },
    null,
    2,
  )}\n`,
);

console.log(`recorded ${records.length} settings to ${OUT}`);
