import { RegistryError, createRegistry, type Registry } from '../registry/registry.js';
import { NOTDEF, type GlyphSet, type GlyphSkeleton } from './types.js';
import { validateGlyphs } from './validate.js';

export function createGlyphSetRegistry(): Registry<GlyphSet> {
  const inner = createRegistry<GlyphSet>('glyph-set');

  return {
    ...inner,
    register(set: GlyphSet): void {
      try {
        validateGlyphs(set.glyphs);
      } catch (error) {
        throw new RegistryError(
          'glyph-set',
          `set "${set.id}" has an invalid glyph: ${(error as Error).message}`,
        );
      }
      if (!Object.hasOwn(set.glyphs, NOTDEF)) {
        throw new RegistryError('glyph-set', `set "${set.id}" defines no notdef glyph`);
      }
      inner.register(set);
    },
  };
}

export function glyphFor(set: GlyphSet, character: string): GlyphSkeleton {
  const found = set.glyphs[character];
  if (found !== undefined) return found;

  const fallback = set.glyphs[NOTDEF];
  if (fallback === undefined) {
    throw new Error(`glyph set "${set.id}" defines no notdef glyph`);
  }
  return fallback;
}
