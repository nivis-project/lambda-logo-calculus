import type { GlyphSkeleton, SkeletonPrimitive, StrokeSegment } from './types.js';

export class GlyphError extends Error {
  constructor(
    readonly character: string,
    reason: string,
  ) {
    super(`glyph "${character}": ${reason}`);
    this.name = 'GlyphError';
  }
}

function finite(...values: number[]): boolean {
  return values.every((value) => typeof value === 'number' && Number.isFinite(value));
}

function checkSegment(character: string, segment: StrokeSegment): void {
  if (segment.kind === 'point') {
    if (!finite(segment.x, segment.y)) throw new GlyphError(character, 'a point is not finite');
    return;
  }
  if (!finite(segment.cx, segment.cy, segment.rx, segment.ry, segment.a0, segment.a1)) {
    throw new GlyphError(character, 'an arc holds a value that is not finite');
  }
  if (segment.rx <= 0 || segment.ry <= 0) {
    throw new GlyphError(character, 'an arc has a radius that is not positive');
  }
}

function checkPart(character: string, part: SkeletonPrimitive): void {
  if (part.kind === 'stroke') {
    const first = part.segments[0];
    if (first === undefined) throw new GlyphError(character, 'a stroke has no segments');
    if (part.segments.length === 1 && first.kind !== 'arc') {
      throw new GlyphError(character, 'a stroke of a single point draws nothing');
    }
    for (const segment of part.segments) checkSegment(character, segment);
    return;
  }

  if (part.kind === 'bowl') {
    if (!finite(part.cx, part.cy, part.rx, part.ry)) {
      throw new GlyphError(character, 'a bowl holds a value that is not finite');
    }
    if (part.rx <= 0 || part.ry <= 0) {
      throw new GlyphError(character, 'a bowl has a radius that is not positive');
    }
    for (const cut of part.cuts) {
      if (!finite(cut.x0, cut.y0, cut.x1, cut.y1)) {
        throw new GlyphError(character, 'a cut region holds a value that is not finite');
      }
    }
    return;
  }

  if (!finite(part.x, part.y, part.r)) {
    throw new GlyphError(character, 'a dot holds a value that is not finite');
  }
  if (part.r <= 0) throw new GlyphError(character, 'a dot has a radius that is not positive');
}

export function validateGlyph(character: string, glyph: GlyphSkeleton): void {
  if (!finite(glyph.advance) || glyph.advance <= 0) {
    throw new GlyphError(character, 'the advance is not a positive finite number');
  }
  if (glyph.parts.length === 0) throw new GlyphError(character, 'it has no parts');

  for (const part of glyph.parts) {
    // A glyph set can arrive as parsed JSON, so the kind is checked rather than
    // trusted, even though the type says it cannot be anything else.
    const kind: string = (part as { kind: string }).kind;
    if (kind !== 'stroke' && kind !== 'bowl' && kind !== 'dot') {
      throw new GlyphError(character, `a part of unknown kind "${kind}"`);
    }
    checkPart(character, part);
  }
}

export function validateGlyphs(glyphs: Readonly<Record<string, GlyphSkeleton>>): void {
  for (const [character, glyph] of Object.entries(glyphs)) validateGlyph(character, glyph);
}
