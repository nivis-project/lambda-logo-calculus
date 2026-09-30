import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  CORE_PACKAGE_VERSION,
  FONT_UNITS_PER_EM,
  registeredTemplateCount,
} from '../src/index.js';

describe('core package', () => {
  it('declares its version', () => {
    expect(CORE_PACKAGE_VERSION).toBe(0);
  });

  it('uses a 1000 unit em, as the glyph grid assumes', () => {
    expect(FONT_UNITS_PER_EM).toBe(1000);
  });

  it('reports the registered template count', () => {
    expect(registeredTemplateCount()).toBe(0);
  });

  it('returns the same count however often it is asked', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 50 }), (times) => {
        const results = Array.from({ length: times }, () => registeredTemplateCount());
        return results.every((value) => value === results[0]);
      }),
    );
  });
});
