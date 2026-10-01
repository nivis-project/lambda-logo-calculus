---
# lambda-logo-calculus-kiee
title: Prototype parity harness and golden snapshots
status: completed
type: epic
priority: normal
created_at: 2026-09-30T22:02:38Z
updated_at: 2026-10-01T06:16:44Z
parent: lambda-logo-calculus-zrss
blocked_by:
    - lambda-logo-calculus-5dnw
---

Prove the port. The core rendering the default settings must reproduce
`reference/trefoil-type.html` within an agreed tolerance, and the golden
snapshot suite must be in place before milestone 03 starts changing anything.

## Scope

- A harness that extracts the prototype's output for a fixed set of settings.
- A comparison that reports geometric difference, with a stated tolerance and a
  justification for it.
- Golden snapshots of the trefoil template against the test string
  "Hamburgefonstiv 0123", stored and reviewed on purpose.
- A documented procedure for approving a snapshot change.

## Todo

- [x] Build the prototype extraction harness
- [x] Define and justify the parity tolerance
- [x] Prove parity for the default settings
- [x] Prove parity across a spread of parameter values
- [x] Add the golden snapshot suite and the approval procedure

## Summary of Changes

Parity is established and measured. 270 tests.

**The headline number: the worst difference across fifteen settings is 0.006953
font units.** The prototype rounds every coordinate it writes to two decimal
places, which puts a floor of `sqrt(2) * 0.005 = 0.007071` on any comparison
against its output. The measured worst sits just under that floor, so the two
implementations agree exactly and what remains is the prototype's own rounding.

The tolerance is therefore derived rather than chosen: 0.02 font units, about
three times the rounding floor, tight enough to catch an error of one
five-hundredth of a stroke width. A test nudges a single coordinate by one unit
and confirms it fails. A second test asserts the worst difference stays at or
below the rounding floor, so the suite fails if the two ever genuinely diverge,
not only if they diverge past the tolerance.

`perfectFit`, the effective scale, the width factor and the modulated x-height
are compared separately and agree to the precision the prototype displays.

**The real find: run splitting was missing.** The prototype splits a stroke into
separate runs wherever it turns by more than 25 degrees, before stroking. The
stages epic declared that threshold as a parameter and never implemented the
splitting, and nothing noticed, because every test until now used single-run
glyphs. The parity harness found it immediately: glyph `n` produced 12 contours
against the prototype's 18. The Split stage is now the fifth built-in stage,
running last, with a delta to the `skeleton-stages` spec.

Three things the harness had to work around, all recorded rather than hidden:

- happy-dom parses the prototype but will not execute it.
- Chromium inside the Nix sandbox closes the page on navigating to the
  prototype, while navigating to the studio on the same server works. Blocking
  its Google Fonts request, disabling the dev shm, running single-process and
  pinning to one worker all failed to change it.
- The prototype's sliders snap to their step, so asking for a fit of 0.05 gets
  0.1 and a naive comparison would be against the wrong value.

The answer to the first two is a committed recording: `scripts/record-parity.mjs`
runs the prototype in a real browser and writes
`test/parity/prototype-output.json`, which the sandboxed gate compares against.
The reference file is frozen, so a recording of it is as current as re-running
it. The alternative was moving parity outside the gate, which would have been
worse. The answer to the third is that the recording stores what the sliders
actually took, and a test fails when that differs from what was asked.

Golden snapshots are in place: the trefoil against "Hamburgefonstiv 0123",
822 KB of SVG, deterministic across runs, and proven to fail when the output
moves. They are dense because the stroker emits polylines; milestone 06's curve
fitter will shrink them. The approval procedure is written into
`docs/testing-strategy.md`.

Capability `prototype-parity` is a main spec with five requirements and sixteen
scenarios, plus a delta adding the Split stage to `skeleton-stages`.

OpenSpec change archived as `2026-10-01-add-parity-harness`.
