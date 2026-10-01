import type { GlyphSet, GridMetrics } from '../glyph/types.js';
import { glyphFor } from '../glyph/registry.js';
import { advanceWithPairs, type GlyphPatches, type SpacingPair } from '../overrides/types.js';

export interface LayoutMetrics {
  readonly set: GlyphSet;
  readonly metrics: GridMetrics;
  readonly widthFactor: number;
  readonly patches?: GlyphPatches;
  readonly pairs?: readonly SpacingPair[];
}

export function advanceOf(character: string, layout: LayoutMetrics): number {
  if (character === ' ') return layout.metrics.wordSpace;
  return glyphFor(layout.set, character).advance * layout.widthFactor + 2 * layout.metrics.sideBearing;
}

export function widthOf(text: string, layout: LayoutMetrics): number {
  const characters = Array.from(text);
  let total = 0;
  for (const [index, character] of characters.entries()) {
    total += advanceWithPairs(
      characters,
      index,
      advanceOf(character, layout),
      layout.patches?.[character],
      layout.pairs ?? [],
    );
  }
  return total;
}

export interface WrapResult {
  readonly lines: readonly string[];
  readonly brokeMidWord: boolean;
}

export function wrapText(text: string, maxWidth: number, layout: LayoutMetrics): WrapResult {
  const pieces: string[] = [];
  let brokeMidWord = false;

  for (const word of text.split(' ')) {
    if (widthOf(word, layout) <= maxWidth) {
      pieces.push(word);
      continue;
    }
    brokeMidWord = true;
    let current = '';
    for (const character of word) {
      if (current !== '' && widthOf(current + character, layout) > maxWidth) {
        pieces.push(current);
        current = '';
      }
      current += character;
    }
    pieces.push(current);
  }

  const lines: string[] = [];
  let current: string | null = null;
  for (const piece of pieces) {
    if (current === null) {
      current = piece;
    } else if (
      widthOf(current, layout) + layout.metrics.wordSpace + widthOf(piece, layout) <=
      maxWidth
    ) {
      current += ' ' + piece;
    } else {
      lines.push(current);
      current = piece;
    }
  }
  if (current !== null) lines.push(current);

  return { lines, brokeMidWord };
}
