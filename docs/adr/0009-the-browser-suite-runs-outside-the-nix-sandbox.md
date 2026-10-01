# 0009. The browser suite runs outside the Nix sandbox

- Status: accepted
- Date: 2026-10-01
- Change: `openspec/changes/archive/2026-10-01-add-studio-shell`
- Amends the gate described in [0002](0002-pnpm-workspaces-and-package-layout.md) and in `quality-gate`

## Context

ADR-era design put the whole gate inside one Nix derivation: build, lint, tests,
coverage and the Playwright suite, all with no network. That held for four
epics. The end-to-end suite ran in the sandbox against the studio and passed.

Adding React to `apps/studio` broke it. Chromium inside the Nix build sandbox
loads the studio page, reports HTTP 200, and is then killed within a second with
no page error, no console output and no crash event. The same build, the same
browser binary and the same tests pass in the dev shell every time.

The cause was looked for and not found. Ruled out by direct experiment inside
the sandbox:

- The browser itself. `about:blank` loads and evaluates script.
- The server. The JavaScript asset is fetched with status 200 and the right
  byte count.
- React. A minimal React page renders and survives.
- `localStorage`. Reading and writing it from the page works.
- The registries and the pipeline. Building the full scene graph in the page
  works and reports the right glyph count.
- DOM volume. The page was reduced from 4.3 MB of path data and 1019 nodes to
  454 KB and 182 nodes. It still dies.
- `<use>` shadow trees. Removed entirely. It still dies.
- Blocking the main thread before first paint. Scene building was moved into an
  effect. It still dies.
- Which part of the component tree renders. With the artboards, the previews and
  the size samples all skipped, leaving a header, two panels and an input, it
  still dies.

What is left is a difference between the two environments that has not been
identified.

## Decision

`nix flake check` runs build, lint, the unit, property, snapshot, boundary and
parity suites, and the coverage thresholds. It no longer runs the browser suite.

`scripts/ship-change.sh` runs `nix flake check` and then
`nix develop -c pnpm e2e`. Both must pass before a change is archived.

The end-to-end suite therefore still gates every ship. It runs in the dev shell,
which is itself pinned by the flake, rather than inside the build sandbox.

## Consequences

A ship is still blocked by a failing browser test. That is the property that
matters, and it is kept.

What is lost is the sandbox's guarantee for that one suite. The browser tests now
run with the developer's network reachable and their environment present. A test
that accidentally depends on either would pass here and fail elsewhere. Nothing
currently does, and the suite is small enough to read.

It also means the gate is two commands rather than one. `/mip:ship` runs both;
anyone running `nix flake check` by hand now gets less than the full gate, and
`AGENTS.md` says so explicitly.

The investigation above is written down rather than summarised, because the next
person to hit this should not have to repeat eight gate cycles to learn what it
is not.

## Alternatives considered

**Keep the suite in the sandbox and leave it red.** Rejected immediately: a gate
that is known to fail is not a gate, and it would have blocked every subsequent
ship.

**Drop the browser suite from the ship gate entirely and run it by hand.**
Rejected. The suite is the only thing that tests undo, the overlays, the
keyboard shortcuts and the panels at all. Making it optional makes it dead.

**Keep bisecting until the cause is found.** This is the alternative with the
best outcome if it succeeds, and it is the one that was tried first. Eight gate
cycles established six things it is not and zero things it is. The cost of
continuing was unbounded and the work it was blocking was not. This record is
the compensation: when the cause is found, it supersedes this ADR.

**Run the browser suite in the sandbox against a simpler page.** Rejected as
dishonest. A test that drives a page the designer never sees proves nothing
about the studio.
