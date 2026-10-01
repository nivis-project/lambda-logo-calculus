## Why

Epic [lambda-logo-calculus-3vto](../../../.beans/lambda-logo-calculus-3vto--shape-template-interface-trefoil-and-nesting-math.md),
under milestone 02 Core geometry and prototype parity.

The base curve is the whole product. In the prototype `cos(3 theta)` is written
out by hand in four separate places (`R`, `rc`, `shapeRho`, `ringPts`), so the
shape cannot be changed without editing all four and hoping none was missed.

This epic replaces all four with one interface and registers the trefoil as its
first implementation, carrying across the nesting mathematics the prototype
proved: `perfectFit` sampled over 720 angles, and `effectiveScale` raising it to
a power that the fit slider controls.

It also moves the prototype's four hidden clamps into the open. `A` is silently
raised to 1.15, `perfectFit` to 0.02, the copy scale capped at 1.6 and the
effective scale at 1.5. Those numbers are the difference between a usable mark
and a degenerate one, and a designer who hits them currently sees a shape that
stops responding with no explanation.

## What Changes

- Add the `ShapeTemplate` interface: `kind` (`polar` or `parametric`),
  `radius(theta, params)` for polar, `point(t, params)` for parametric, an
  optional `symmetry`, and `safety` metadata.
- Register the trefoil: `r(theta) = A + cos(3 theta)`, with `A` from 1 to 20,
  default 3, and `symmetry` 3.
- Add `perfectFit(template, params, phi)`: the numeric minimum over theta of
  `r(theta) / r(theta - phi)`, sampled 720 times as the prototype does.
- Add `effectiveScale(perfectFit, fit)`: `perfectFit^(1 - 5 fit)`, and the
  per-copy scale `min(effectiveScale^i, maxCopyScale)`.
- Add `sampleCurve(template, params, count)`, returning points normalised by the
  template's own maximum radius, as the prototype normalises by `A + 1`.
- Move the four clamps into per-template `safety` metadata, and have the
  computation return a list of warnings naming each clamp that was applied,
  instead of applying them silently.
- Memoise `perfectFit` by template id, version, parameters and rotation, since
  the prototype recomputes 720 samples on every change.
- Reverse the dependency between `packages/core` and `packages/templates`. ADR
  0002 put templates upstream of the core; a template implements an interface
  the core defines, so the direction has to run the other way. Writing the first
  real template is what exposed it, because attempting both directions at once
  is an import cycle. ADR 0008 supersedes that part of 0002.

## Capabilities

### New Capabilities

- `shape-template`: what a base curve is, how it is sampled, how copies nest
  inside it, and what the studio does when parameters reach a safety limit.

### Modified Capabilities

None.

## Impact

- New under `packages/core/src/template`: the interface, the sampling, the
  nesting mathematics and the memo.
- The trefoil itself lives in `packages/templates`, which depends on the core
  from this change onwards. `apps/studio` creates the registry and registers the
  built-ins, so the core stays a leaf with no workspace dependency.
- New: `docs/adr/0008-templates-depend-on-core.md`. ADR 0002 is marked as partly
  superseded rather than edited.
- The studio's smoke test now asserts a real computed `perfectFit`, so the
  end-to-end suite proves the ported mathematics reaches the screen.
- `perfectFit` at 720 samples is the prototype's number and is kept for parity.
  Whether it can be lowered is a performance question for milestone 06, decided
  against the parity harness rather than guessed here.
- Warnings are returned as data, not logged. The core has no console, and the
  studio needs them to show in the panel next to the parameter that tripped.
- Nothing renders yet. The output of this change is geometry as numbers, checked
  against the known values in `docs/testing-strategy.md`.
