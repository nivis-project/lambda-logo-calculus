## 1. Measuring

- [x] 1.1 Add the v8 coverage provider and a coverage script. Verify
  `pnpm test:cov` produces a report naming `packages/core/src/index.ts`.
- [x] 1.2 Set the thresholds in `vitest.config.ts`: 70 percent for statements,
  branches, functions and lines across the project, and 80 percent for
  `packages/core/src/**`. Verify the configured numbers are the ones in the
  spec.
- [x] 1.3 Have the gate run the coverage command rather than the plain one, and
  print the measured figures whether it passes or fails. Verify a passing gate
  shows the coverage summary.
- [x] 1.4 Update the dependency hash in `nix/gate.nix`, because `package.json`
  changed. Verify `nix flake check` installs offline and passes.

## 2. Proving the floors bite

- [x] 2.1 Verify the overall floor fails: add a source file with an untested
  function, confirm the gate goes red naming the measured figure against 70,
  then remove it.
- [x] 2.2 Verify the core floor fails independently: get the project figure
  above 70 while a core package sits below 80, confirm the gate goes red naming
  the core package, then remove it.
- [x] 2.3 Verify branches are counted, not just lines: add a function with two
  paths and a test taking one, confirm branch coverage reflects it, then remove
  it.

## 3. The strategy

- [x] 3.1 Write `docs/testing-strategy.md` naming the kinds of test this project
  uses, what each proves that the others cannot, and when each applies. Verify
  it covers every kind milestone 02 and 03 will need, including the parity
  comparison.
- [x] 3.2 Say in that document what coverage is and is not evidence of, and why
  the core floor is higher. Verify the two numbers in it match the two in
  `vitest.config.ts`.
- [x] 3.3 Point `AGENTS.md` at the strategy and add the coverage commands.
  Verify every command named there runs.

## 4. Verification

- [x] 4.1 Verify `nix flake check` is green, reports coverage, and that the
  figures it reports match a local `pnpm test:cov`.
