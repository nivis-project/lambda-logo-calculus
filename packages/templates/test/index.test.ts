import { describe, expect, it } from 'vitest';
import {
  TEMPLATES_PACKAGE_VERSION,
  builtInShapeTemplates,
  builtInTemplates,
} from '../src/index.js';

describe('templates package', () => {
  it('declares its data version', () => {
    expect(TEMPLATES_PACKAGE_VERSION).toBe(0);
  });

  it('ships the trefoil as its first shape template', () => {
    expect(builtInShapeTemplates.map((t) => t.id)).toContain('trefoil');
  });

  it('summarises every shape template in its manifest', () => {
    expect(builtInTemplates).toEqual(
      builtInShapeTemplates.map((t) => ({ id: t.id, version: t.version })),
    );
  });
});
