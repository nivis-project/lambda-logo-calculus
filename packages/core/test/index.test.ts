import { describe, expect, it } from 'vitest';
import { CORE_PACKAGE_VERSION, FONT_UNITS_PER_EM } from '../src/index.js';

describe('core package', () => {
  it('declares its version', () => {
    expect(CORE_PACKAGE_VERSION).toBe(0);
  });

  it('uses a 1000 unit em, as the glyph grid assumes', () => {
    expect(FONT_UNITS_PER_EM).toBe(1000);
  });
});
