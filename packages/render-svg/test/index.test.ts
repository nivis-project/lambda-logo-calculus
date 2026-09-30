import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { RENDER_SVG_PACKAGE_VERSION, viewBoxForEm } from '../src/index.js';

describe('render-svg package', () => {
  it('declares its version', () => {
    expect(RENDER_SVG_PACKAGE_VERSION).toBe(0);
  });

  it('scales a one by one em box to font units', () => {
    expect(viewBoxForEm(1, 1)).toBe('0 0 1000 1000');
  });

  it('always emits four space separated numbers', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 100, noNaN: true }),
        fc.double({ min: 0, max: 100, noNaN: true }),
        (w, h) => {
          const parts = viewBoxForEm(w, h).split(' ');
          return parts.length === 4 && parts.every((p) => Number.isFinite(Number(p)));
        },
      ),
    );
  });
});
