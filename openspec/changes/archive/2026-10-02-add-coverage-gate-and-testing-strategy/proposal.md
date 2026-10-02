## Why

Epic [lambda-logo-calculus-8yw4](../../../.beans/lambda-logo-calculus-8yw4--test-harness-and-the-coverage-gate.md),
under milestone 01 Foundations and the ship gate.

The gate runs the tests. It does not ask whether the tests touch anything.

That gap matters most in exactly the situation this project is about to be in.
Milestone 03 ports a 791-line prototype, function by function, and the easiest
way to port a function badly is to port it, write one test for the path you were
thinking about, and move on. Coverage does not prove a test is good. It does
prove nobody forgot.

There is a second gap, harder to see and more expensive. Nothing says what kind
of test to write. "Add tests" is advice that produces a hundred assertions about
return values and nothing that would catch a stage quietly reading a global. The
kinds of test this project needs are not obvious, they are not all unit tests,
and deciding them while porting is deciding them under pressure.

## What Changes

- Measure coverage in the gate and enforce a floor: 70 percent across the
  project, 80 percent on the core packages.
- Make the thresholds bite on branches as well as lines, because a branch nobody
  took is the thing coverage is actually for.
- Write `docs/testing-strategy.md` naming the kinds of test this project uses,
  what each one is for, and when each applies.
- Say in that document what coverage is and is not evidence of, so the number
  does not become the goal.

## Capabilities

### Modified Capabilities

- `quality-gate`: the gate measures coverage and fails below the floors. This
  adds a requirement rather than changing one.

### New Capabilities

<!-- none -->

## Impact

- Changed: `vitest.config.ts` (coverage provider and thresholds),
  `package.json` (a coverage dependency and script), `scripts/gate.sh`,
  `nix/gate.nix` (the dependency hash, because `package.json` changes),
  `AGENTS.md`.
- New: `docs/testing-strategy.md`.
- The workspace currently holds one exported constant and two tests. The
  thresholds will pass trivially, which is not evidence that they work. The
  tasks verify them by introducing an untested branch on purpose and confirming
  the gate goes red.
- The core threshold is higher than the overall one, and the reason is in the
  strategy document rather than left as a number someone has to guess at.
