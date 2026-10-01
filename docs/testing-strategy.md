# Testing strategy

The core is tested like a mathematics library and the studio like a design tool.
Four kinds of test, each proving something the others cannot.

## 1. Known values

The mathematics has answers we can write down before running anything. A known
value test fails loudly when a refactor quietly changes the numbers.

The values fixed by `docs/briefing.md`:

- `perfectFit` is 1 at rotation 0 for the trefoil.
- `perfectFit` is 1 at rotation 120 degrees for the trefoil, because
  `r = A + cos 3 theta` has three-fold symmetry.
- `effectiveScale` equals `perfectFit` at fit size 0, since
  `s_i = perfectFit^(i (1 - 5 f))` collapses to `perfectFit^i` when `f` is 0.

Defaults ported from the prototype are known values too, and each is asserted at
the place it is defined: nib 6.5, bowl inset 5, loop radius 11, bend 0.22,
optical 1.06, gap 0.6.

Known value tests live next to the function they pin, in `packages/core`.

## 2. Property tests

An invariant holds for every parameter set, not just the ones someone thought
of. Written with fast-check, so a failure comes back with a shrunk counterexample.

The invariants the brief requires:

- A stroke that starts on the baseline still ends on the baseline after every
  skeleton stage, for random stage parameters.
- Bowl counters stay open. A bowl that closes is a glyph with no hole.
- Exported paths close, and contain no `NaN`.
- A nested copy never crosses its parent outline, for any template and any copy
  index.
- The seeded random source returns the same sequence for the same seed, and a
  different one for a different seed.
- No whitelisted custom formula can reach a global.

A property test that fails is never fixed by narrowing its generator. Either the
invariant is wrong and the test changes with an explanation, or the code is
wrong.

## 3. Golden snapshots

Each template rendered against the fixed test string "Hamburgefonstiv 0123",
stored as SVG. The string is chosen because it exercises ascenders, descenders,
bowls, counters, diagonals, round and flat terminals, and digits in one line.

A snapshot changing is not a failure by itself. It is a question: was this
intended?

Snapshots live in `test/snapshots/` and are written by `test/snapshots.test.ts`.

They are rendered at **two copies**, not the six the studio defaults to, and at
two decimal places. A geometry regression shows up identically at two copies as
at six, because every stage runs the same way for each; six copies is three
times the bytes for no extra signal. Even so they are large, because the stroker
emits dense polylines. The curve fitter in milestone 06 will shrink them
considerably.

**Approving a snapshot change:**

1. Regenerate with `pnpm test -u` and look at the visual diff, not the text
   diff. The diff of an SVG path is unreadable; the picture is not. Open the old
   and the new file side by side in a browser.
2. Confirm the change is what the OpenSpec change under implementation asked
   for. A snapshot that moved for a reason not in the change is a bug, and the
   right response is to find out why it moved, not to accept it.
3. Commit the new snapshot in the same commit as the code that moved it, and
   name the movement in the changelog entry.

Never regenerate snapshots to make a red gate green. That is how a regression
becomes the new baseline.

## 4. End-to-end

Playwright against the real studio, built, in a browser. These prove the things
unit tests cannot: that a parameter definition actually produced a control, that
undo actually restores, that an export actually matches the screen.

Each milestone gate names its own end-to-end test. The suite runs in the ship
gate, so a broken interaction blocks a commit the same way a broken function
does.

It runs in the dev shell rather than inside the Nix sandbox, because Chromium
inside that sandbox cannot load the studio page. ADR 0009 records the
investigation and what was ruled out. `scripts/ship-change.sh` runs it after
`nix flake check` and stops on either failing, so the suite still gates every
ship.

## Parity with the prototype

Milestone 02 carries one more obligation. The ported core rendering the default
settings must reproduce `reference/trefoil-type.html` within a stated tolerance.

The harness runs the prototype itself. `scripts/record-parity.mjs` loads
`reference/trefoil-type.html` into Chromium, drives its real controls, reads
back the values its sliders actually took, and writes what it renders to
`test/parity/prototype-output.json`. `test/parity.test.ts` compares that against
what the core computes. Nothing of the prototype is reimplemented, because a
reimplementation would only prove that two transcriptions agree.

The recording is a committed file rather than a live browser run, because
Chromium inside the Nix sandbox closes the page on navigating to the prototype,
while navigating to the studio on the same server works. The alternative was to
move parity outside the gate, which would have been worse. `reference/
trefoil-type.html` is frozen, so a recording of it is as current as re-running
it; `pnpm parity:record` regenerates it.

Two guards keep the recording honest. It stores the values the prototype's
sliders actually took rather than the values asked for, and a test fails when
those differ, so a snapped slider is never silently compared against an
unsnapped expectation. And a test asserts the recording covers several
amplitudes, rotations and glyphs, so it cannot shrink to one easy case.

**The tolerance is 0.02 font units, and it is derived rather than chosen.**

The prototype rounds every coordinate it writes to two decimal places through
its `f2()` helper. A coordinate can therefore be out by up to 0.005 in each
axis, which is a distance of `sqrt(2) * 0.005 = 0.00707` font units. That is the
floor: no comparison against the prototype's output can be tighter than it,
however correct both implementations are.

The measured worst difference across the whole settings matrix is **0.006953
font units**, which sits just under that floor. The two implementations agree
exactly, and what is left is the prototype's own rounding.

The tolerance is set at 0.02, roughly three times the rounding floor. It is
tight enough to catch an error of one five-hundredth of a stroke width. A test
confirms that nudging a single coordinate by one font unit fails.

Two comparisons are exact rather than tolerant, because they are pure arithmetic
over the same formula: `perfectFit` and the effective scale agree to the three
decimal places the prototype displays, across a matrix of thirteen settings.

**Parity is a one-time gate.** Once milestone 02 is archived, the golden
snapshots take over as the baseline, and the prototype stops being authoritative
for anything except reading. The parity suite stays in the repository as the
record of the port, not as the thing later changes are measured against.

## The export geometry

Two numbers are pinned by a test rather than described, because both are claims
about output a reader cannot check by eye.

**The fitter stays inside its tolerance.** Every point of every ring lies within
`DEFAULT_FIT_TOLERANCE` of the fitted path, measured as a distance to the path
and not to a sample of it. A test asserts it for a circle, for a wobbling ring
and for the wordmark, and asserts that tightening the tolerance never makes the
worst deviation larger.

**The tolerance is 0.2 font units, and it is chosen so the file gets smaller.**
A cubic command costs about three times a line command in path data, so a
tolerance tight enough to follow every facet produces a larger file than the
polylines it replaced. Measured against "Hamburgefonstiv" at one copy:

| tolerance | segments | path data | against the polylines |
| --------- | -------- | --------- | --------------------- |
| 0.05      | 3000     | 125811    | 1.17x larger          |
| 0.1       | 2381     | 100378    | 1.07x smaller         |
| 0.2       | 1974     | 83677     | 1.28x smaller         |
| 0.5       | 1391     | 59795     | 1.79x smaller         |
| 1.0       | 936      | 41211     | 2.60x smaller         |

The polylines are 8581 points and 107297 bytes. 0.2 font units is one fiftieth
of a stroke width; at a 50 mm cap height it is 0.12 mm, under what a press
holds.

**The boolean engine needs its input snapped.** `polygon-clipping` throws
"Unable to find segment in SweepLine tree" on some glyph outlines at some
parameter values, which ADR 0006 named as the risk it was taking. The engine
snaps every coordinate to a grid before handing it over, at 0.0001 font units
first and then two coarser steps if that still fails. A property test over
random amplitude, rotation and copy count is what found it, and is what keeps it
found.

**What limits the reduction is the stroker, not the fitter.** The outlines are
faceted: a third of their points turn by more than 15 degrees, with a median
spacing of half a font unit. A cubic cannot span a corner, so the fitter splits
at each one. Raising the stroker's sampling would buy more here than tightening
the fitter, and that belongs to the performance epic rather than this one. The
figures above are asserted by a test, so a change to the stroker that smooths
its output shows up as a failing expectation rather than going unnoticed.

## Coverage

The ship gate enforces:

- 70% statements and branches overall
- 80% on `packages/core`

The core threshold is higher because it is pure: there is no excuse for an
untested branch in a function with no IO. Coverage is a floor, not a target. A
file at 100% with no property test is less tested than a file at 80% with one.

## Running them

```sh
nix develop -c pnpm test          # known values and property tests
nix develop -c pnpm test:cov      # with the coverage thresholds
nix develop -c pnpm e2e           # Playwright against the built studio
nix flake check                   # everything, as the ship gate runs it
```
