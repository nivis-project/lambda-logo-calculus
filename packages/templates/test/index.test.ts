import { describe, expect, it } from 'vitest';
import { TEMPLATES_PACKAGE_VERSION, builtInTemplates } from '../src/index.js';

describe('templates package', () => {
  it('declares its data version', () => {
    expect(TEMPLATES_PACKAGE_VERSION).toBe(0);
  });

  it('starts with no registered template', () => {
    expect(builtInTemplates).toHaveLength(0);
  });
});
