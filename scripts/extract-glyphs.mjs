// Extracts the alphabet from the prototype's own glyph table, by evaluating it
// with helpers that record structure instead of sampling. Required by name in
// openspec change add-grid-and-alphabet, task 2.1.
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'reference', 'trefoil-type.html'), 'utf8');
const body = src.slice(src.indexOf('function buildGlyphs(){ return {') + 'function buildGlyphs(){ return {'.length,
                       src.indexOf('}; }\n  let GL'));

// Stubs that record structure instead of sampling.
// The prototype's arc() returns sampled points, and a second arc is spliced on
// with .slice(1) to drop the point the two share. Here an arc stays an arc, so
// .slice(1) records that the shared first point is dropped when it is sampled.
const arc = (cx, cy, rx, ry, a0, a1) => {
  const list = [{ kind: 'arc', cx, cy, rx, ry, a0, a1, skipFirst: false }];
  list.slice = (from) =>
    from === 1
      ? [{ kind: 'arc', cx, cy, rx, ry, a0, a1, skipFirst: true }]
      : Array.prototype.slice.call(list, from);
  return list;
};
const seg = (s) => (Array.isArray(s) ? { kind: 'point', x: s[0], y: s[1] } : s);
const S = (...pts) => ({ kind: 'stroke', segments: pts.map(seg) });
const SA = (...segs) => ({ kind: 'stroke', segments: [].concat(...segs).map(seg) });
const B = (cx, cy, rx, ry, cuts = []) => ({ kind: 'bowl', cx, cy, rx, ry, cuts: cuts.map(([x0,y0,x1,y1]) => ({ x0, y0, x1, y1 })) });
const Dt = (x, y, r = 7) => ({ kind: 'dot', x, y, r });
const g = (advance, ...parts) => ({ advance, parts });
const X = 56, C = 86, D = -28;

export function extractGlyphs() {
  return new Function('arc', 'S', 'SA', 'B', 'Dt', 'g', 'X', 'C', 'D', `return {${body}};`)(
    arc, S, SA, B, Dt, g, X, C, D,
  );
}

if (process.argv[1] && process.argv[1].endsWith('extract-glyphs.mjs')) {
  process.stdout.write(`${JSON.stringify(extractGlyphs(), null, 1)}\n`);
}
