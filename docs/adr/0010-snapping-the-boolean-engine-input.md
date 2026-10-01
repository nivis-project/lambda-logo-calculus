# 0010. The boolean engine's input is snapped to a grid

- Status: accepted
- Date: 2026-10-01
- Change: `openspec/changes/archive/2026-10-01-add-path-booleans-and-fitting`

## Context

ADR 0006 chose `polygon-clipping` and said so with a warning attached: it is
less robust than Clipper2 against degenerate input, glyph outlines at extreme
parameter values produce exactly that kind of input, and the decision was
untested because nothing exercised it until milestone 06.

Milestone 06 exercised it. A property test over random amplitude, rotation and
copy count failed on the first run it was given:

```
Error: Unable to find segment #979715 [18.47605403608718, 15.70800144316171]
-> [18.601728330938855, 15.151498464217957] in SweepLine tree.
```

This is the library's known precision failure. Its sweep line keeps an ordered
tree of segments, and two segments whose intersection is computed slightly
differently from two directions get ordered inconsistently, after which a lookup
that must succeed does not. It is not a bad input: both rings are closed,
well formed and enclose area. It is floating-point arithmetic on coordinates
that carry seventeen significant digits.

The stroker produces exactly the shape that triggers it. It samples a support
function per direction, so neighbouring points on an outline are a fraction of a
font unit apart and their coordinates differ in the last few digits.

## Decision

The engine snaps every coordinate to a grid before handing the rings to
`polygon-clipping`, and retries at a coarser grid when the library still throws.
The steps are 0.0001, 0.001 and 0.01 font units. When all three fail it throws a
named error rather than returning something wrong.

## Consequences

The finest step, 0.0001 font units, is two thousand times smaller than the
curve fitter's 0.2 tolerance and a hundred thousandth of a stroke width. Nothing
downstream can see it. The measured output moved by four points out of 8581 and
85 bytes out of 107297 when snapping was added, which is the whole visible cost.

Snapping removes the failure by making coincident points exactly coincident
rather than nearly so, which is the condition the sweep line's ordering actually
needs. It does not make the library robust; it removes the input that defeats
it. A different shape could still defeat it, and the coarser retries and the
named error are there for that.

ADR 0006 is not superseded. Its decision stands and the risk it recorded turned
out to be real, bounded and cheap to mitigate. If a later failure survives all
three snapping steps, that is the evidence for Clipper2 that 0006 said it was
waiting for.

The property test that found this stays in the gate, because the failure
depended on parameter values nobody would have thought to write down.

## Alternatives considered

**Catch and fall back to the unclipped rings.** Simple, and the export would
never fail. Rejected: it produces a file whose counters are wrong without saying
so, which is worse than refusing.

**Round the coordinates at the source, in the stroker.** Fewer digits
everywhere, and the parity harness already shows two decimal places is enough to
match the prototype. Rejected for now: the stroker's output feeds the preview,
the bounds and the snapshots, and changing it to fix an export problem puts the
cost in the wrong place.

**Move to Clipper2 now.** It is the first alternative ADR 0006 named, and it is
more robust against this exact input. Rejected: one mitigated failure is not the
evidence for vendoring and hashing a WASM artifact in the Nix sandbox. The
reason to switch would be a failure snapping cannot fix.
