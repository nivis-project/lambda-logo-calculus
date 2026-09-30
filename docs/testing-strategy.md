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

**Approving a snapshot change:**

1. Regenerate with `pnpm test -u` and look at the visual diff, not the text
   diff. The diff of an SVG path is unreadable; the picture is not.
2. Confirm the change is what the OpenSpec change under implementation asked
   for. A snapshot that moved for a reason not in the change is a bug.
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

## Parity with the prototype

Milestone 02 carries one more obligation. The ported core rendering the default
settings must reproduce `reference/trefoil-type.html` within a stated tolerance.

The tolerance is defined and justified in the parity epic, not chosen while
staring at a failure. A parity test that is loosened to pass has proved nothing.

Parity is a one-time gate. Once milestone 02 is archived, the golden snapshots
take over as the baseline and the prototype stops being authoritative for
anything except reading.

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
