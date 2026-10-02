## Why

Epic [lambda-logo-calculus-2ujg](../../../.beans/lambda-logo-calculus-2ujg--read-and-describe-the-prototype.md),
under milestone 02 The prototype described.

Milestone 03 ports the prototype. It cannot start until somebody has read the
prototype and written down what it does, because a port written from a skim is a
port that reproduces the parts its author happened to notice.

The reading has now been done: all 791 lines. It turned up what a skim would
have missed. Three parameters silently drive values nobody named. Nine clamps
sit inline with no explanation. The amplitude is floored at 1.15 for the
letters and not for the shape they are drawn with, so below that value the mark
and the letters disagree about what curve they are made of. The rendered
geometry depends on the width of the container it is rendered into.

None of that is written anywhere. All of it has to be, before anything is built
to match it.

## What Changes

- Describe every control: its range, its step, its default, and what it drives
  beyond the obvious.
- Describe the base curve, the nesting search, the effective scale, and the
  copies, with every clamp named and its value recorded.
- Describe the grid and the alphabet: what a glyph is made of and what the
  numbers mean.
- Describe the four reshaping stages and the switch each one hangs off.
- Describe the stroker: how a run becomes an outline, what a free end is, and
  what each of the nine endings does in each of its two forms.
- Describe the layout: advances, wrapping, the lockup, the palettes and the
  three different ways the opacity slider is remapped.
- Name every hidden coupling as a coupling, and every clamp as a safety limit,
  rather than leaving them as arithmetic someone has to rediscover.

These are descriptions of the prototype, written as requirements the port will
have to meet. Nothing is built here.

## Capabilities

### New Capabilities

- `parameters`: every control, what it holds, what it drives, how locking and
  randomize behave.
- `shape-and-nesting`: the curve, the fit search, the scale of each copy, and
  the limits that bound them.
- `glyph-skeletons`: the grid, the alphabet as data, and the four stages that
  reshape a skeleton.
- `stroking`: the pen, runs, free ends, the nine endings and the looped join.
- `layout-and-lockup`: advances, wrapping, the mark's placement, the palettes
  and the opacity remaps.

### Modified Capabilities

<!-- none -->

## Impact

- New: five spec files. No source changes.
- Every requirement here is a claim about `reference/trefoil-type.html` and is
  checkable by reading it. Where the prototype's own notes and its code
  disagree, the code wins and the disagreement is recorded.
- Two findings are not descriptions but defects, and they are written down as
  what the prototype does rather than quietly fixed: the amplitude floor that
  applies to the letters and not the shape, and the dependence of the rendered
  geometry on the container width. Milestone 03 has to decide what to do about
  each, and cannot decide until they are on the record.
