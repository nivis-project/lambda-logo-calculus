## Why

Epic [lambda-logo-calculus-koee](../../../.beans/lambda-logo-calculus-koee--parametric-nesting-and-curve-validation.md),
under milestone 03 Templates and registries.

Nesting currently works one way: compute `perfectFit` as the minimum over theta
of `r(theta) / r(theta - phi)`. That ratio only means anything when the curve is
star-shaped about its centre, so that every ray from the origin crosses it once.

Four of the five built-in templates satisfy that. The rounded polygon with a
deep star does not, and a custom formula typed by a designer will not in general.
The existing route gives a plausible-looking wrong answer in those cases, which
is worse than refusing.

The brief asks for the general route: find the largest scale at which the
rotated copy still sits inside its parent, by binary search with a
point-in-polygon test.

## What Changes

- Add point-in-polygon and a polygon containment test.
- Add parametric nesting: binary search for the largest scale at which every
  point of the rotated, scaled copy lies inside the parent outline.
- Add curve validation: a curve must close, stay non-negative, and for the polar
  route stay star-shaped about its centre.
- Choose the route automatically. A template that validates as star-shaped uses
  the polar route; one that does not uses the parametric route, and the choice is
  reported so the studio can say which it took and why.
- Extend the memo to cover the parametric route.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `shape-template`: nesting gains a second route, a validation step that decides
  which route applies, and a reported reason when the polar route is refused.

## Impact

- New under `packages/core/src/template`: the geometry predicates, the
  validation and the parametric search.
- The parametric route is substantially slower: a binary search where each step
  tests every sampled point against the parent polygon, against a single pass of
  720 divisions. It is only taken when the polar route does not apply, and the
  memo covers it.
- Validation runs on the curve, not on the parameters, so it catches a custom
  formula that is fine at one setting and degenerate at another.
- The existing polar results must not move. Every template that validates as
  star-shaped keeps the exact value it produced before, which the parity
  recording and the golden snapshots both check.
