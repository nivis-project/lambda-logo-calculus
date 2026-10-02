import { NOTDEF, type GlyphSkeleton } from './types.js';

// Extracted from reference/trefoil-type.html by scripts/extract-glyphs.mjs.
// Do not edit by hand: a test re-runs the extraction and compares.
// Required by name in openspec change add-grid-and-alphabet, task 2.2.
export const latinGlyphs: Readonly<Record<string, GlyphSkeleton>> = {
  '0': {
    advance: 56,
    parts: [
      { kind: 'bowl', cx: 28, cy: 43, rx: 28, ry: 43, cuts: [] },
    ],
  },
  '1': {
    advance: 40,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 10, y: 68 }, { kind: 'point', x: 28, y: 86 }, { kind: 'point', x: 28, y: 0 }] },
    ],
  },
  '2': {
    advance: 56,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'arc', cx: 28, cy: 62, rx: 23, ry: 22, a0: 160, a1: -20, skipFirst: false }, { kind: 'point', x: 4, y: 0 }, { kind: 'point', x: 54, y: 0 }] },
    ],
  },
  '3': {
    advance: 52,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'arc', cx: 26, cy: 64.5, rx: 21, ry: 21.5, a0: 150, a1: -90, skipFirst: false }, { kind: 'arc', cx: 26, cy: 21.5, rx: 24, ry: 21.5, a0: 90, a1: -150, skipFirst: true }] },
    ],
  },
  '4': {
    advance: 58,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 44, y: 0 }, { kind: 'point', x: 44, y: 86 }, { kind: 'point', x: 2, y: 24 }, { kind: 'point', x: 56, y: 24 }] },
    ],
  },
  '5': {
    advance: 56,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 50, y: 86 }, { kind: 'point', x: 10, y: 86 }, { kind: 'point', x: 8, y: 50 }] },
      { kind: 'stroke', segments: [{ kind: 'arc', cx: 28, cy: 28, rx: 24, ry: 28, a0: 140, a1: -150, skipFirst: false }] },
    ],
  },
  '6': {
    advance: 56,
    parts: [
      { kind: 'bowl', cx: 28, cy: 28, rx: 26, ry: 28, cuts: [] },
      { kind: 'stroke', segments: [{ kind: 'arc', cx: 34, cy: 40, rx: 32, ry: 44, a0: 80, a1: 180, skipFirst: false }] },
    ],
  },
  '7': {
    advance: 56,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 2, y: 86 }, { kind: 'point', x: 54, y: 86 }, { kind: 'point', x: 18, y: 0 }] },
    ],
  },
  '8': {
    advance: 56,
    parts: [
      { kind: 'bowl', cx: 28, cy: 65, rx: 20, ry: 21, cuts: [] },
      { kind: 'bowl', cx: 28, cy: 22, rx: 25, ry: 22, cuts: [] },
    ],
  },
  '9': {
    advance: 56,
    parts: [
      { kind: 'bowl', cx: 28, cy: 58, rx: 26, ry: 28, cuts: [] },
      { kind: 'stroke', segments: [{ kind: 'arc', cx: 22, cy: 46, rx: 32, ry: 44, a0: -100, a1: 0, skipFirst: false }] },
    ],
  },
  'a': {
    advance: 48,
    parts: [
      { kind: 'bowl', cx: 22, cy: 28, rx: 22, ry: 28, cuts: [] },
      { kind: 'stroke', segments: [{ kind: 'point', x: 43, y: 0 }, { kind: 'point', x: 43, y: 56 }] },
    ],
  },
  'b': {
    advance: 48,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 5, y: 0 }, { kind: 'point', x: 5, y: 86 }] },
      { kind: 'bowl', cx: 26, cy: 28, rx: 22, ry: 28, cuts: [] },
    ],
  },
  'c': {
    advance: 48,
    parts: [
      { kind: 'bowl', cx: 24, cy: 28, rx: 24, ry: 28, cuts: [{ x0: 33, y0: 17, x1: 60, y1: 40 }] },
    ],
  },
  'd': {
    advance: 48,
    parts: [
      { kind: 'bowl', cx: 22, cy: 28, rx: 22, ry: 28, cuts: [] },
      { kind: 'stroke', segments: [{ kind: 'point', x: 43, y: 0 }, { kind: 'point', x: 43, y: 86 }] },
    ],
  },
  'e': {
    advance: 48,
    parts: [
      { kind: 'bowl', cx: 24, cy: 28, rx: 24, ry: 28, cuts: [{ x0: 30, y0: 7, x1: 60, y1: 24 }] },
      { kind: 'stroke', segments: [{ kind: 'point', x: 2, y: 30 }, { kind: 'point', x: 46, y: 30 }] },
    ],
  },
  'f': {
    advance: 40,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 12, y: 0 }, { kind: 'point', x: 12, y: 70 }, { kind: 'arc', cx: 26, cy: 70, rx: 14, ry: 14, a0: 180, a1: 30, skipFirst: false }] },
      { kind: 'stroke', segments: [{ kind: 'point', x: 0, y: 56 }, { kind: 'point', x: 30, y: 56 }] },
    ],
  },
  'g': {
    advance: 48,
    parts: [
      { kind: 'bowl', cx: 22, cy: 28, rx: 22, ry: 28, cuts: [] },
      { kind: 'stroke', segments: [{ kind: 'point', x: 43, y: 56 }, { kind: 'point', x: 43, y: -8 }, { kind: 'arc', cx: 22, cy: -8, rx: 21, ry: 17, a0: 0, a1: -160, skipFirst: false }] },
    ],
  },
  'h': {
    advance: 48,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 5, y: 0 }, { kind: 'point', x: 5, y: 86 }] },
      { kind: 'stroke', segments: [{ kind: 'arc', cx: 24, cy: 34, rx: 19, ry: 22, a0: 180, a1: 0, skipFirst: false }, { kind: 'point', x: 43, y: 0 }] },
    ],
  },
  'i': {
    advance: 14,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 7, y: 0 }, { kind: 'point', x: 7, y: 56 }] },
      { kind: 'dot', x: 7, y: 72, r: 7 },
    ],
  },
  'j': {
    advance: 26,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 19, y: 56 }, { kind: 'point', x: 19, y: -10 }, { kind: 'arc', cx: 7, cy: -10, rx: 12, ry: 16, a0: 0, a1: -160, skipFirst: false }] },
      { kind: 'dot', x: 19, y: 72, r: 7 },
    ],
  },
  'k': {
    advance: 46,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 5, y: 0 }, { kind: 'point', x: 5, y: 86 }] },
      { kind: 'stroke', segments: [{ kind: 'point', x: 44, y: 56 }, { kind: 'point', x: 7, y: 22 }] },
      { kind: 'stroke', segments: [{ kind: 'point', x: 20, y: 29 }, { kind: 'point', x: 46, y: 0 }] },
    ],
  },
  'l': {
    advance: 14,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 7, y: 0 }, { kind: 'point', x: 7, y: 86 }] },
    ],
  },
  'm': {
    advance: 72,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 5, y: 0 }, { kind: 'point', x: 5, y: 56 }] },
      { kind: 'stroke', segments: [{ kind: 'arc', cx: 20.5, cy: 36, rx: 15.5, ry: 20, a0: 180, a1: 0, skipFirst: false }, { kind: 'point', x: 36, y: 0 }] },
      { kind: 'stroke', segments: [{ kind: 'arc', cx: 51.5, cy: 36, rx: 15.5, ry: 20, a0: 180, a1: 0, skipFirst: false }, { kind: 'point', x: 67, y: 0 }] },
    ],
  },
  'n': {
    advance: 48,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 5, y: 0 }, { kind: 'point', x: 5, y: 56 }] },
      { kind: 'stroke', segments: [{ kind: 'arc', cx: 24, cy: 34, rx: 19, ry: 22, a0: 180, a1: 0, skipFirst: false }, { kind: 'point', x: 43, y: 0 }] },
    ],
  },
  'o': {
    advance: 48,
    parts: [
      { kind: 'bowl', cx: 24, cy: 28, rx: 24, ry: 28, cuts: [] },
    ],
  },
  'p': {
    advance: 48,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 5, y: 56 }, { kind: 'point', x: 5, y: -28 }] },
      { kind: 'bowl', cx: 26, cy: 28, rx: 22, ry: 28, cuts: [] },
    ],
  },
  'q': {
    advance: 48,
    parts: [
      { kind: 'bowl', cx: 22, cy: 28, rx: 22, ry: 28, cuts: [] },
      { kind: 'stroke', segments: [{ kind: 'point', x: 43, y: 56 }, { kind: 'point', x: 43, y: -28 }] },
    ],
  },
  'r': {
    advance: 36,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 5, y: 0 }, { kind: 'point', x: 5, y: 56 }] },
      { kind: 'stroke', segments: [{ kind: 'arc', cx: 24, cy: 34, rx: 19, ry: 22, a0: 180, a1: 60, skipFirst: false }] },
    ],
  },
  's': {
    advance: 48,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'arc', cx: 24, cy: 42, rx: 19, ry: 14, a0: 20, a1: 270, skipFirst: false }, { kind: 'arc', cx: 24, cy: 14, rx: 19, ry: 14, a0: 90, a1: -160, skipFirst: true }] },
    ],
  },
  't': {
    advance: 36,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 14, y: 70 }, { kind: 'point', x: 14, y: 14 }, { kind: 'arc', cx: 26, cy: 14, rx: 12, ry: 14, a0: 180, a1: 300, skipFirst: false }] },
      { kind: 'stroke', segments: [{ kind: 'point', x: 0, y: 56 }, { kind: 'point', x: 32, y: 56 }] },
    ],
  },
  'u': {
    advance: 48,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 5, y: 56 }, { kind: 'point', x: 5, y: 22 }, { kind: 'arc', cx: 24, cy: 22, rx: 19, ry: 22, a0: 180, a1: 360, skipFirst: false }] },
      { kind: 'stroke', segments: [{ kind: 'point', x: 43, y: 56 }, { kind: 'point', x: 43, y: 0 }] },
    ],
  },
  'v': {
    advance: 48,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 0, y: 56 }, { kind: 'point', x: 24, y: 0 }, { kind: 'point', x: 48, y: 56 }] },
    ],
  },
  'w': {
    advance: 72,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 0, y: 56 }, { kind: 'point', x: 18, y: 0 }, { kind: 'point', x: 36, y: 48 }, { kind: 'point', x: 54, y: 0 }, { kind: 'point', x: 72, y: 56 }] },
    ],
  },
  'x': {
    advance: 48,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 2, y: 0 }, { kind: 'point', x: 46, y: 56 }] },
      { kind: 'stroke', segments: [{ kind: 'point', x: 2, y: 56 }, { kind: 'point', x: 46, y: 0 }] },
    ],
  },
  'y': {
    advance: 48,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 0, y: 56 }, { kind: 'point', x: 26, y: 4 }] },
      { kind: 'stroke', segments: [{ kind: 'point', x: 48, y: 56 }, { kind: 'point', x: 14, y: -28 }] },
    ],
  },
  'z': {
    advance: 48,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 2, y: 56 }, { kind: 'point', x: 46, y: 56 }, { kind: 'point', x: 2, y: 0 }, { kind: 'point', x: 46, y: 0 }] },
    ],
  },
  'A': {
    advance: 60,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 0, y: 0 }, { kind: 'point', x: 30, y: 86 }, { kind: 'point', x: 60, y: 0 }] },
      { kind: 'stroke', segments: [{ kind: 'point', x: 12, y: 30 }, { kind: 'point', x: 48, y: 30 }] },
    ],
  },
  'B': {
    advance: 56,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 5, y: 0 }, { kind: 'point', x: 5, y: 86 }] },
      { kind: 'bowl', cx: 28, cy: 64.5, rx: 22, ry: 21.5, cuts: [] },
      { kind: 'bowl', cx: 30, cy: 21.5, rx: 26, ry: 21.5, cuts: [] },
    ],
  },
  'C': {
    advance: 62,
    parts: [
      { kind: 'bowl', cx: 32, cy: 43, rx: 30, ry: 43, cuts: [{ x0: 42, y0: 30, x1: 70, y1: 57 }] },
    ],
  },
  'D': {
    advance: 58,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 5, y: 0 }, { kind: 'point', x: 5, y: 86 }] },
      { kind: 'bowl', cx: 30, cy: 43, rx: 28, ry: 43, cuts: [] },
    ],
  },
  'E': {
    advance: 52,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 50, y: 86 }, { kind: 'point', x: 5, y: 86 }, { kind: 'point', x: 5, y: 0 }, { kind: 'point', x: 50, y: 0 }] },
      { kind: 'stroke', segments: [{ kind: 'point', x: 5, y: 43 }, { kind: 'point', x: 42, y: 43 }] },
    ],
  },
  'F': {
    advance: 50,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 50, y: 86 }, { kind: 'point', x: 5, y: 86 }, { kind: 'point', x: 5, y: 0 }] },
      { kind: 'stroke', segments: [{ kind: 'point', x: 5, y: 43 }, { kind: 'point', x: 42, y: 43 }] },
    ],
  },
  'G': {
    advance: 62,
    parts: [
      { kind: 'bowl', cx: 32, cy: 43, rx: 30, ry: 43, cuts: [{ x0: 42, y0: 40, x1: 70, y1: 64 }] },
      { kind: 'stroke', segments: [{ kind: 'point', x: 34, y: 36 }, { kind: 'point', x: 60, y: 36 }] },
    ],
  },
  'H': {
    advance: 60,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 5, y: 0 }, { kind: 'point', x: 5, y: 86 }] },
      { kind: 'stroke', segments: [{ kind: 'point', x: 55, y: 0 }, { kind: 'point', x: 55, y: 86 }] },
      { kind: 'stroke', segments: [{ kind: 'point', x: 5, y: 43 }, { kind: 'point', x: 55, y: 43 }] },
    ],
  },
  'I': {
    advance: 14,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 7, y: 0 }, { kind: 'point', x: 7, y: 86 }] },
    ],
  },
  'J': {
    advance: 46,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 40, y: 86 }, { kind: 'point', x: 40, y: 22 }, { kind: 'arc', cx: 22, cy: 22, rx: 18, ry: 22, a0: 0, a1: -180, skipFirst: false }] },
    ],
  },
  'K': {
    advance: 56,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 5, y: 0 }, { kind: 'point', x: 5, y: 86 }] },
      { kind: 'stroke', segments: [{ kind: 'point', x: 52, y: 86 }, { kind: 'point', x: 6, y: 34 }] },
      { kind: 'stroke', segments: [{ kind: 'point', x: 22, y: 50 }, { kind: 'point', x: 54, y: 0 }] },
    ],
  },
  'L': {
    advance: 50,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 5, y: 86 }, { kind: 'point', x: 5, y: 0 }, { kind: 'point', x: 48, y: 0 }] },
    ],
  },
  'M': {
    advance: 72,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 5, y: 0 }, { kind: 'point', x: 5, y: 86 }, { kind: 'point', x: 36, y: 20 }, { kind: 'point', x: 67, y: 86 }, { kind: 'point', x: 67, y: 0 }] },
    ],
  },
  'N': {
    advance: 60,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 5, y: 0 }, { kind: 'point', x: 5, y: 86 }, { kind: 'point', x: 55, y: 0 }, { kind: 'point', x: 55, y: 86 }] },
    ],
  },
  'O': {
    advance: 64,
    parts: [
      { kind: 'bowl', cx: 32, cy: 43, rx: 32, ry: 43, cuts: [] },
    ],
  },
  'P': {
    advance: 54,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 5, y: 0 }, { kind: 'point', x: 5, y: 86 }] },
      { kind: 'bowl', cx: 28, cy: 62, rx: 24, ry: 24, cuts: [] },
    ],
  },
  'Q': {
    advance: 64,
    parts: [
      { kind: 'bowl', cx: 32, cy: 43, rx: 32, ry: 43, cuts: [] },
      { kind: 'stroke', segments: [{ kind: 'point', x: 38, y: 18 }, { kind: 'point', x: 62, y: -6 }] },
    ],
  },
  'R': {
    advance: 56,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 5, y: 0 }, { kind: 'point', x: 5, y: 86 }] },
      { kind: 'bowl', cx: 28, cy: 62, rx: 24, ry: 24, cuts: [] },
      { kind: 'stroke', segments: [{ kind: 'point', x: 26, y: 38 }, { kind: 'point', x: 54, y: 0 }] },
    ],
  },
  'S': {
    advance: 56,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'arc', cx: 28, cy: 64.5, rx: 23, ry: 21.5, a0: 20, a1: 270, skipFirst: false }, { kind: 'arc', cx: 28, cy: 21.5, rx: 25, ry: 21.5, a0: 90, a1: -160, skipFirst: true }] },
    ],
  },
  'T': {
    advance: 56,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 0, y: 86 }, { kind: 'point', x: 56, y: 86 }] },
      { kind: 'stroke', segments: [{ kind: 'point', x: 28, y: 86 }, { kind: 'point', x: 28, y: 0 }] },
    ],
  },
  'U': {
    advance: 60,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 5, y: 86 }, { kind: 'point', x: 5, y: 30 }, { kind: 'arc', cx: 30, cy: 30, rx: 25, ry: 30, a0: 180, a1: 360, skipFirst: false }, { kind: 'point', x: 55, y: 86 }] },
    ],
  },
  'V': {
    advance: 60,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 0, y: 86 }, { kind: 'point', x: 30, y: 0 }, { kind: 'point', x: 60, y: 86 }] },
    ],
  },
  'W': {
    advance: 80,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 0, y: 86 }, { kind: 'point', x: 20, y: 0 }, { kind: 'point', x: 40, y: 64 }, { kind: 'point', x: 60, y: 0 }, { kind: 'point', x: 80, y: 86 }] },
    ],
  },
  'X': {
    advance: 60,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 2, y: 0 }, { kind: 'point', x: 58, y: 86 }] },
      { kind: 'stroke', segments: [{ kind: 'point', x: 2, y: 86 }, { kind: 'point', x: 58, y: 0 }] },
    ],
  },
  'Y': {
    advance: 60,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 0, y: 86 }, { kind: 'point', x: 30, y: 42 }, { kind: 'point', x: 60, y: 86 }] },
      { kind: 'stroke', segments: [{ kind: 'point', x: 30, y: 42 }, { kind: 'point', x: 30, y: 0 }] },
    ],
  },
  'Z': {
    advance: 60,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 4, y: 86 }, { kind: 'point', x: 56, y: 86 }, { kind: 'point', x: 4, y: 0 }, { kind: 'point', x: 56, y: 0 }] },
    ],
  },
  ".": {
    advance: 14,
    parts: [
      { kind: 'dot', x: 7, y: 7, r: 7 },
    ],
  },
  ",": {
    advance: 16,
    parts: [
      { kind: 'dot', x: 8, y: 7, r: 7 },
      { kind: 'stroke', segments: [{ kind: 'point', x: 9, y: 2 }, { kind: 'point', x: 3, y: -12 }] },
    ],
  },
  "!": {
    advance: 14,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 7, y: 86 }, { kind: 'point', x: 7, y: 26 }] },
      { kind: 'dot', x: 7, y: 7, r: 7 },
    ],
  },
  "?": {
    advance: 52,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'arc', cx: 26, cy: 64, rx: 20, ry: 20, a0: 160, a1: -70, skipFirst: false }, { kind: 'point', x: 26, y: 30 }] },
      { kind: 'dot', x: 26, y: 7, r: 7 },
    ],
  },
  "-": {
    advance: 32,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 2, y: 30 }, { kind: 'point', x: 30, y: 30 }] },
    ],
  },
  "'": {
    advance: 14,
    parts: [
      { kind: 'stroke', segments: [{ kind: 'point', x: 7, y: 86 }, { kind: 'point', x: 7, y: 62 }] },
    ],
  },
  [NOTDEF]: {
    advance: 40,
    parts: [
      { kind: 'bowl', cx: 20, cy: 28, rx: 20, ry: 28, cuts: [] },
    ],
  },
};
