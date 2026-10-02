import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const prototype = pathToFileURL(join(root, 'reference', 'trefoil-type.html')).href;
const outDir = join(root, 'test', 'parity');

export const CONTAINER_WIDTH = 1100;

// b bowl and stem, o bowl, n arc, g descender, i dot, v diagonal, T arm, 3 digit
export const TEXT = 'bongivT3';

const SETTINGS = [
  { A: 3, n: 6, rot: 24, fit: 0, alpha: 0.22, pal: 'Analogous', end: 'round' },
  { A: 1.2, n: 6, rot: 24, fit: 0, alpha: 0.22, pal: 'Analogous', end: 'round' },
  { A: 8, n: 6, rot: 24, fit: 0, alpha: 0.22, pal: 'Analogous', end: 'round' },
  { A: 20, n: 6, rot: 24, fit: 0, alpha: 0.22, pal: 'Analogous', end: 'round' },
  { A: 3, n: 1, rot: 24, fit: 0, alpha: 0.22, pal: 'Analogous', end: 'round' },
  { A: 3, n: 12, rot: 24, fit: 0, alpha: 0.22, pal: 'Analogous', end: 'round' },
  { A: 3, n: 6, rot: 0, fit: 0, alpha: 0.22, pal: 'Analogous', end: 'round' },
  { A: 3, n: 6, rot: 60, fit: 0, alpha: 0.22, pal: 'Analogous', end: 'round' },
  { A: 3, n: 6, rot: 120, fit: 0, alpha: 0.22, pal: 'Analogous', end: 'round' },
  { A: 3, n: 6, rot: 180, fit: 0, alpha: 0.22, pal: 'Analogous', end: 'round' },
  { A: 3, n: 6, rot: 24, fit: -1, alpha: 0.22, pal: 'Analogous', end: 'round' },
  { A: 3, n: 6, rot: 24, fit: -0.5, alpha: 0.22, pal: 'Analogous', end: 'round' },
  { A: 3, n: 6, rot: 24, fit: 0.5, alpha: 0.22, pal: 'Analogous', end: 'round' },
  { A: 3, n: 6, rot: 24, fit: 1, alpha: 0.22, pal: 'Analogous', end: 'round' },
  { A: 3, n: 3, rot: 24, fit: 0, alpha: 0.22, pal: 'Analogous', end: 'flat' },
  { A: 3, n: 3, rot: 24, fit: 0, alpha: 0.22, pal: 'Analogous', end: 'angled' },
  { A: 3, n: 3, rot: 24, fit: 0, alpha: 0.22, pal: 'Analogous', end: 'taper' },
  { A: 3, n: 3, rot: 24, fit: 0, alpha: 0.22, pal: 'Analogous', end: 'flare' },
  { A: 3, n: 3, rot: 24, fit: 0, alpha: 0.22, pal: 'Analogous', end: 'wedge' },
  { A: 3, n: 3, rot: 24, fit: 0, alpha: 0.22, pal: 'Analogous', end: 'slab' },
  { A: 3, n: 3, rot: 24, fit: 0, alpha: 0.22, pal: 'Analogous', end: 'hair' },
  { A: 3, n: 3, rot: 24, fit: 0, alpha: 0.22, pal: 'Analogous', end: 'ball' },
  { A: 3, n: 2, rot: 24, fit: 0, alpha: 0.05, pal: 'Monochrome', end: 'round' },
  { A: 3, n: 2, rot: 24, fit: 0, alpha: 0.6, pal: 'Complementary', end: 'round' },
  { A: 3, n: 2, rot: 24, fit: 0, alpha: 0.22, pal: 'Triadic', end: 'round' },
  { A: 3, n: 2, rot: 24, fit: 0, alpha: 0.22, pal: 'Warm', end: 'round' },
  { A: 3, n: 2, rot: 24, fit: 0, alpha: 0.22, pal: 'Cool', end: 'round' },
];

const NUMERIC = ['A', 'n', 'rot', 'fit', 'alpha'];
const CHOICE = ['pal', 'end'];

async function recordOne(page, asked) {
  const actual = await page.evaluate(
    ({ asked, numeric, choice, text }) => {
      const set = (id, value) => {
        const el = document.getElementById(id);
        el.value = String(value);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return el.value;
      };

      const took = {};
      for (const id of numeric) took[id] = Number(set(id, asked[id]));
      for (const id of choice) took[id] = set(id, asked[id]);

      const field = document.getElementById('txt');
      field.value = text;
      field.dispatchEvent(new Event('input', { bubbles: true }));

      return took;
    },
    { asked, numeric: NUMERIC, choice: CHOICE, text: TEXT },
  );

  const drawn = await page.evaluate(() => {
    const svg = document.querySelector('#stage svg');
    const read = (id) => document.getElementById(id).textContent;
    return {
      viewBox: svg.getAttribute('viewBox'),
      readouts: {
        perfectFit: read('rpf'),
        effectiveScale: read('ref'),
        smallestCopy: read('rmin'),
        letterWidth: read('rsx'),
        xHeight: read('rxh'),
      },
      glyphs: [...svg.querySelectorAll('g[transform^="translate"]')]
        .filter((g) => g.getAttribute('transform').includes('scale(1 -1)'))
        .map((g) => ({
          transform: g.getAttribute('transform'),
          passes: [...g.querySelectorAll(':scope > g')].map((pass) => ({
            fill: pass.getAttribute('fill'),
            opacity: pass.getAttribute('opacity'),
            paths: [...pass.querySelectorAll('path')].map((p) => p.getAttribute('d')),
            uses: [...pass.querySelectorAll('use')].map((u) => u.getAttribute('transform')),
          })),
        })),
    };
  });

  return { asked, actual, ...drawn };
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: CONTAINER_WIDTH + 60, height: 900 } });

  await page.goto(prototype);
  await page.waitForSelector('#stage svg');

  const stageWidth = await page.evaluate(() => document.getElementById('stage').clientWidth);

  mkdirSync(outDir, { recursive: true });

  const index = [];
  for (const [i, asked] of SETTINGS.entries()) {
    const recording = await recordOne(page, asked);
    const name = `${String(i).padStart(2, '0')}-A${asked.A}-n${asked.n}-r${asked.rot}-f${asked.fit}-${asked.end}-${asked.pal.toLowerCase()}.json`;
    writeFileSync(join(outDir, name), `${JSON.stringify(recording, null, 1)}\n`, 'utf8');
    index.push({ file: name, asked, actual: recording.actual, readouts: recording.readouts });
  }

  await browser.close();

  const manifest = {
    recordedFrom: 'reference/trefoil-type.html',
    containerWidth: stageWidth,
    viewportWidth: CONTAINER_WIDTH + 60,
    text: TEXT,
    rounding: {
      decimals: 2,
      perAxis: 0.005,
      asDistance: Math.SQRT2 * 0.005,
      tolerance: 0.02,
    },
    recordings: index,
  };

  writeFileSync(join(outDir, 'index.json'), `${JSON.stringify(manifest, null, 1)}\n`, 'utf8');

  console.log(`recorded ${index.length} settings at a container width of ${stageWidth}`);
  console.log(`wrote ${outDir}`);
}

await main();
