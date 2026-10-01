import {
  GRID,
  NOTDEF,
  type ArcSegment,
  type BowlPrimitive,
  type CutRegion,
  type DotPrimitive,
  type GlyphSet,
  type GlyphSkeleton,
  type StrokePrimitive,
  type StrokeSegment,
} from '@trefoil/core';

const X = GRID.xHeight;
const C = GRID.capHeight;
const D = GRID.descender;
const DOT = GRID.dotRadius;

function p(x: number, y: number): StrokeSegment {
  return { kind: 'point', x, y };
}

function a(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number): ArcSegment {
  return { kind: 'arc', cx, cy, rx, ry, a0, a1 };
}

function s(...segments: StrokeSegment[]): StrokePrimitive {
  return { kind: 'stroke', segments };
}

function b(cx: number, cy: number, rx: number, ry: number, cuts: CutRegion[] = []): BowlPrimitive {
  return { kind: 'bowl', cx, cy, rx, ry, cuts };
}

function cut(x0: number, y0: number, x1: number, y1: number): CutRegion {
  return { x0, y0, x1, y1 };
}

function dot(x: number, y: number, r: number = DOT): DotPrimitive {
  return { kind: 'dot', x, y, r };
}

function g(advance: number, ...parts: GlyphSkeleton['parts']): GlyphSkeleton {
  return { advance, parts };
}

export const latinGlyphs: Readonly<Record<string, GlyphSkeleton>> = {
  a: g(48, b(22, 28, 22, 28), s(p(43, 0), p(43, X))),
  b: g(48, s(p(5, 0), p(5, C)), b(26, 28, 22, 28)),
  c: g(48, b(24, 28, 24, 28, [cut(33, 17, 60, 40)])),
  d: g(48, b(22, 28, 22, 28), s(p(43, 0), p(43, C))),
  e: g(48, b(24, 28, 24, 28, [cut(30, 7, 60, 24)]), s(p(2, 30), p(46, 30))),
  f: g(40, s(p(12, 0), p(12, 70), a(26, 70, 14, 14, 180, 30)), s(p(0, X), p(30, X))),
  g: g(48, b(22, 28, 22, 28), s(p(43, X), p(43, -8), a(22, -8, 21, 17, 0, -160))),
  h: g(48, s(p(5, 0), p(5, C)), s(a(24, 34, 19, 22, 180, 0), p(43, 0))),
  i: g(14, s(p(7, 0), p(7, X)), dot(7, X + 16)),
  j: g(26, s(p(19, X), p(19, -10), a(7, -10, 12, 16, 0, -160)), dot(19, X + 16)),
  k: g(46, s(p(5, 0), p(5, C)), s(p(44, X), p(7, 22)), s(p(20, 29), p(46, 0))),
  l: g(14, s(p(7, 0), p(7, C))),
  m: g(
    72,
    s(p(5, 0), p(5, X)),
    s(a(20.5, 36, 15.5, 20, 180, 0), p(36, 0)),
    s(a(51.5, 36, 15.5, 20, 180, 0), p(67, 0)),
  ),
  n: g(48, s(p(5, 0), p(5, X)), s(a(24, 34, 19, 22, 180, 0), p(43, 0))),
  o: g(48, b(24, 28, 24, 28)),
  p: g(48, s(p(5, X), p(5, D)), b(26, 28, 22, 28)),
  q: g(48, b(22, 28, 22, 28), s(p(43, X), p(43, D))),
  r: g(36, s(p(5, 0), p(5, X)), s(a(24, 34, 19, 22, 180, 60))),
  s: g(48, s(a(24, 42, 19, 14, 20, 270), a(24, 14, 19, 14, 90, -160))),
  t: g(36, s(p(14, 70), p(14, 14), a(26, 14, 12, 14, 180, 300)), s(p(0, X), p(32, X))),
  u: g(48, s(p(5, X), p(5, 22), a(24, 22, 19, 22, 180, 360)), s(p(43, X), p(43, 0))),
  v: g(48, s(p(0, X), p(24, 0), p(48, X))),
  w: g(72, s(p(0, X), p(18, 0), p(36, 48), p(54, 0), p(72, X))),
  x: g(48, s(p(2, 0), p(46, X)), s(p(2, X), p(46, 0))),
  y: g(48, s(p(0, X), p(26, 4)), s(p(48, X), p(14, D))),
  z: g(48, s(p(2, X), p(46, X), p(2, 0), p(46, 0))),

  A: g(60, s(p(0, 0), p(30, C), p(60, 0)), s(p(12, 30), p(48, 30))),
  B: g(56, s(p(5, 0), p(5, C)), b(28, 64.5, 22, 21.5), b(30, 21.5, 26, 21.5)),
  C: g(62, b(32, 43, 30, 43, [cut(42, 30, 70, 57)])),
  D: g(58, s(p(5, 0), p(5, C)), b(30, 43, 28, 43)),
  E: g(52, s(p(50, C), p(5, C), p(5, 0), p(50, 0)), s(p(5, 43), p(42, 43))),
  F: g(50, s(p(50, C), p(5, C), p(5, 0)), s(p(5, 43), p(42, 43))),
  G: g(62, b(32, 43, 30, 43, [cut(42, 40, 70, 64)]), s(p(34, 36), p(60, 36))),
  H: g(60, s(p(5, 0), p(5, C)), s(p(55, 0), p(55, C)), s(p(5, 43), p(55, 43))),
  I: g(14, s(p(7, 0), p(7, C))),
  J: g(46, s(p(40, C), p(40, 22), a(22, 22, 18, 22, 0, -180))),
  K: g(56, s(p(5, 0), p(5, C)), s(p(52, C), p(6, 34)), s(p(22, 50), p(54, 0))),
  L: g(50, s(p(5, C), p(5, 0), p(48, 0))),
  M: g(72, s(p(5, 0), p(5, C), p(36, 20), p(67, C), p(67, 0))),
  N: g(60, s(p(5, 0), p(5, C), p(55, 0), p(55, C))),
  O: g(64, b(32, 43, 32, 43)),
  P: g(54, s(p(5, 0), p(5, C)), b(28, 62, 24, 24)),
  Q: g(64, b(32, 43, 32, 43), s(p(38, 18), p(62, -6))),
  R: g(56, s(p(5, 0), p(5, C)), b(28, 62, 24, 24), s(p(26, 38), p(54, 0))),
  S: g(56, s(a(28, 64.5, 23, 21.5, 20, 270), a(28, 21.5, 25, 21.5, 90, -160))),
  T: g(56, s(p(0, C), p(56, C)), s(p(28, C), p(28, 0))),
  U: g(60, s(p(5, C), p(5, 30), a(30, 30, 25, 30, 180, 360), p(55, C))),
  V: g(60, s(p(0, C), p(30, 0), p(60, C))),
  W: g(80, s(p(0, C), p(20, 0), p(40, 64), p(60, 0), p(80, C))),
  X: g(60, s(p(2, 0), p(58, C)), s(p(2, C), p(58, 0))),
  Y: g(60, s(p(0, C), p(30, 42), p(60, C)), s(p(30, 42), p(30, 0))),
  Z: g(60, s(p(4, C), p(56, C), p(4, 0), p(56, 0))),

  '0': g(56, b(28, 43, 28, 43)),
  '1': g(40, s(p(10, 68), p(28, C), p(28, 0))),
  '2': g(56, s(a(28, 62, 23, 22, 160, -20), p(4, 0), p(54, 0))),
  '3': g(52, s(a(26, 64.5, 21, 21.5, 150, -90), a(26, 21.5, 24, 21.5, 90, -150))),
  '4': g(58, s(p(44, 0), p(44, C), p(2, 24), p(56, 24))),
  '5': g(56, s(p(50, C), p(10, C), p(8, 50)), s(a(28, 28, 24, 28, 140, -150))),
  '6': g(56, b(28, 28, 26, 28), s(a(34, 40, 32, 44, 80, 180))),
  '7': g(56, s(p(2, C), p(54, C), p(18, 0))),
  '8': g(56, b(28, 65, 20, 21), b(28, 22, 25, 22)),
  '9': g(56, b(28, 58, 26, 28), s(a(22, 46, 32, 44, -100, 0))),

  '.': g(14, dot(7, 7)),
  ',': g(16, dot(8, 7), s(p(9, 2), p(3, -12))),
  '!': g(14, s(p(7, C), p(7, 26)), dot(7, 7)),
  '?': g(52, s(a(26, 64, 20, 20, 160, -70), p(26, 30)), dot(26, 7)),
  '-': g(32, s(p(2, 30), p(30, 30))),
  "'": g(14, s(p(7, C), p(7, 62))),

  [NOTDEF]: g(40, b(20, 28, 20, 28)),
};

export const latinGlyphSet: GlyphSet = {
  id: 'latin-basic',
  version: 1,
  label: 'Basic Latin',
  params: [],
  metrics: GRID,
  glyphs: latinGlyphs,
};
