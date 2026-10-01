## Why

Epic [lambda-logo-calculus-kiee](../../../.beans/lambda-logo-calculus-kiee--prototype-parity-harness-and-golden-snapshots.md),
under milestone 02 Core geometry and prototype parity.

Every epic in this milestone claimed to port something, and each was checked
against values read out of the prototype's source by hand. That is good enough
for a formula and useless for a whole wordmark: nobody can read 78 outlines and
say whether they match.

This epic closes the milestone's gate. It runs the prototype's own code and the
ported core over the same settings and compares what comes out. Until that
passes, "ported" is a claim rather than a fact.

It also sets up the baseline that replaces it. Once parity holds, the prototype
stops being authoritative and golden snapshots take over, so milestone 03 can
start changing things on purpose and see exactly what moved.

## What Changes

- Add a harness that loads `reference/trefoil-type.html`, runs its functions in
  a sandbox with a fixed set of settings, and reads its geometry out.
- Add a geometric comparison that reports the difference between two point sets,
  rather than comparing strings, because a difference of one in the last decimal
  place is not a difference.
- Define and justify the tolerance. State what it is, why it is that number, and
  what sort of difference it would and would not catch.
- Prove parity for the prototype's default settings and for a spread of
  parameter values across amplitude, rotation, copies, fit, palette and ending.
- Add the golden snapshot suite: each template against the test string
  "Hamburgefonstiv 0123", stored as SVG and compared on every run.
- Write the procedure for approving a snapshot change, in
  `docs/testing-strategy.md`, where it already has a section waiting for it.
- Add the run-splitting stage. The prototype splits a stroke into separate runs
  wherever it turns by more than 25 degrees, before stroking. That was declared
  as a parameter in the stages epic and never implemented, and the parity
  harness is what found it: every multi-run glyph produced the wrong number of
  contours. This change adds the stage and a delta to `skeleton-stages`.

## Capabilities

### New Capabilities

- `prototype-parity`: what parity means, what is compared, what the tolerance is
  and when parity stops being the baseline.

### Modified Capabilities

- `skeleton-stages`: a fifth built-in stage, run splitting, and the default
  stage order it joins.

## Impact

- New under `test/parity`: the harness, the comparison and the settings matrix.
- New under `test/snapshots`: the stored golden SVG files.
- The prototype only runs in a real browser. happy-dom parses it but will not
  execute it, and Chromium inside the Nix sandbox closes the page on navigating
  to it, while navigating to the studio on the same server works. Rather than
  weaken the gate by moving parity outside it, the prototype is run in a browser
  by a committed script and its output recorded into
  `test/parity/prototype-output.json`, which the sandboxed gate compares
  against. The reference file is frozen, so a recording of it is as current as
  re-running it.
- Parity is expected to be close but not exact. The two implementations differ
  in sampling order and in where the stages run, both deliberately. The
  tolerance is what makes "close" a number rather than an opinion.
- If parity cannot be reached within a defensible tolerance, that is a finding
  about the port, and the epic reports it rather than widening the tolerance
  until it passes.
