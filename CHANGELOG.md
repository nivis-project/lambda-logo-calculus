# Changelog

All notable changes to Trefoil Studio are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- Geometry a designer can hand over. An export unites each pass into real shapes
  with real holes, so a counter is a hole rather than a fill rule the receiving
  tool has to agree with, and fits the stroker's polylines to Bezier curves
  within a stated tolerance. The tolerance is 0.2 font units, chosen because it
  is the point where the file starts getting smaller rather than larger, and the
  measurement behind that is in the testing strategy. A property test caught the
  boolean library losing a segment on real glyph geometry, which is the risk
  ADR 0006 recorded when it chose that library; ADR 0010 records the snapping
  that answers it.
- A project file. Save the logo to disk and open it again, exactly as it was:
  the template and its version, every parameter, the stage list, the modulation
  list, the per-glyph patches, the spacing pairs, the palette, the mark and the
  seed. A file is checked field by field on load and refused with a report
  naming every field that is wrong, and one from a version this studio does not
  read is refused by name rather than guessed at. Opening is one command, so it
  undoes.
- One letter can be wrong without the system being wrong. A per-glyph patch
  nudges, scales, respaces or re-ends a single character on top of whatever the
  parameters produced, so it survives a template change instead of freezing the
  glyph. Click a letter on the canvas to open it. Spacing pairs do the same
  between two characters, and they run inside layout, so they change the
  wrapping and the lockup rather than being nudged in afterwards.
- The prototype's two hidden links are visible and editable. The amplitude
  driving letter width and the fit size driving the x-height are now two entries
  in a modulation list a designer can retarget, weaken or delete. A new entry can
  drive any stage parameter from the character's position in the word or a
  seeded random value.
- A logo, not just a wordmark. Lockups are registered modules returning
  placements: the mark beside the text or centred above it, sized against the
  text block and enlarged 6% optically. The mark is measured by the geometry it
  actually draws, not by the box it was rendered into, so a trefoil's empty
  corners do not push the wordmark away.
- Randomize, which respects every lock, draws from the seed stored in the
  project, and puts each result in a variant strip so none is lost. One press is
  one undo. Variants restore on click, can be kept by hand, and can be removed.

### Added

- The ship script validates the OpenSpec change before it runs the gate, so a
  malformed delta stops the ship in a second rather than after the build, the
  lint, the test suite and the browser suite have all run.
- The panels are generated from parameter definitions, not written by hand. A
  parameter added to any registered module gets a control, a lock, a value
  readout and a reset without a line of UI code. Double-click a slider to type
  an exact value; out of range is clamped and says so.
- A stage list that switches, reorders and edits each stage, and a template
  gallery with live thumbnails drawn at the project's own copies, rotation and
  palette.
- The studio has a shell: a top bar, a shape panel, a canvas with three
  artboards, a letters and lockup panel, and a bottom strip with the text field
  and a preview at 16, 32, 64 and 128 pixels on light and dark. Zoom, pan,
  five switchable overlays and keyboard shortcuts for undo, redo, zoom and the
  overlays.
- The studio has state, and every change to it is a command. Undo, redo,
  autosave and variant snapshots all come from one log, so no feature has to
  implement them again. The project state is frozen, so the only way to change
  it is through a command.
- A designer can type their own base curve. The formula is parsed into an
  expression tree and walked, never executed as code: no `eval`, no `Function`,
  no dynamic import, and the build fails if any of the three appears in the core.
  Only a declared parameter, the curve variable or one of fourteen whitelisted
  names resolves; everything else is refused with the position in the text.
- Nesting now has a second route. A curve that is not star-shaped about its
  centre, which the polar ratio silently gets wrong, is nested by searching for
  the largest scale at which the rotated copy still fits inside its parent. The
  studio is told which route was taken and why.
- Four more base curves: rose, superellipse, supershape and rounded polygon. The
  trefoil is the rose at three lobes, which is now a test rather than a claim.
- A template's symmetry can depend on its own parameters, so the rose follows its
  lobe count and the polygon its side count.
- The port is measured, not claimed. The prototype is run in a real browser and
  its output compared against the core across fifteen settings. The worst
  difference is 0.007 font units, which is the prototype's own two-decimal
  rounding: the two implementations agree exactly.
- Run splitting, which the prototype does at turns over 25 degrees and the port
  had missed. Every multi-run glyph was producing the wrong number of contours.
- Golden snapshots of each template against "Hamburgefonstiv 0123", with a
  written procedure for approving a change to one.
- The pipeline runs end to end. Parameters go in at the top and a wordmark comes
  out on screen, drawn with the base curve as the pen.
- The scene graph: plain, serialisable nodes that renderers and exporters read
  and nothing writes back to. No masks, and ids assigned by the renderer rather
  than a global counter.
- All six palettes with the prototype's formulas, line wrapping, and a lockup
  that sizes the mark against the text block and stacks it when space runs out.
- An SVG renderer that reads only the scene graph.
- Letters now have width. The support-function stroker turns a skeleton into an
  outline, and the base curve can act as the pen, so the same shape that draws
  the mark decides how thick each letter is in each direction.
- All nine stroke endings, each in a plain and a shape-built form, plus the
  looped join. Serifs on vertical stems lie flat; balls appear only on curved
  ends.
- Taper and flare are a width profile on the stroker rather than added geometry,
  so a tapered end narrows the stroke itself.
- One pipeline from skeleton to outline. Ornaments are a style applied to its
  output, not a second code path.
- The four transformations that give the letterforms their character are now an
  ordered, switchable list of pure functions: curves warps arcs by the base
  curve, bowls builds counters from it, bend bows straight runs, proportions
  scales width and remaps height. None of them reads a global any more.
- Eight numbers the prototype hard-coded are now named parameters under an
  Advanced flag, with the prototype's values as defaults.
- The whole alphabet is data: 69 glyph skeletons of strokes, bowls, dots and cut
  regions on a shared grid, with arcs stored as centre, radii and angles rather
  than as points someone already sampled. A glyph no longer depends on the
  amplitude, the rotation or which stages happen to be switched on.
- An unknown character falls back to a notdef glyph instead of breaking the
  render.
- The base curve is a registered template rather than a formula written out in
  four places. The trefoil ships as the first one, with the prototype's nesting
  mathematics: `perfectFit` over 720 angles and the effective scale the fit
  slider drives.
- The prototype's four hidden clamps are now declared safety limits that report
  a warning naming the limit and both values, instead of a shape that quietly
  stops responding.
- Parameters are declared once as data: a definition carries its kind, range,
  default, lock and randomize behaviour, and resolution, validation and
  randomize are all derived from it. Randomize respects locks and draws from a
  stored seed, so a result is reproducible.
- A typed registry per extension point, which refuses a duplicate id so a typo
  cannot silently shadow a built-in module.
- Seven architecture decision records covering the stack and structural choices
  the project already runs on, each with the alternatives that lost.
- A gate that cannot be skipped: `nix flake check` builds, lints, runs the test
  suite with coverage thresholds and drives the studio in a real browser, all
  inside the Nix sandbox with no network.
- `scripts/ship-change.sh`, which refuses to archive or commit anything when the
  gate is red, a task is still unchecked, or the bean it was given does not
  exist.
- A pnpm workspace under strict TypeScript, with the geometry core's purity
  enforced twice: a lint rule while you type, and a test that reads the built
  bundle and cannot be switched off by editing a config.
- A Nix flake with a dev shell carrying Node 24, pnpm, jj, git and Playwright
  browsers, so every machine and every check resolve the same toolchain.
- The documents every later epic reads from: agent instructions, the brief, the
  prototype that the parity gate compares against, the testing strategy and the
  decision record template.

### Changed

- `packages/templates` now depends on `packages/core` rather than the reverse,
  so the core is a leaf and the application does the wiring. ADR 0008 records
  why; ADR 0002 is marked, not rewritten.
- Shipping now closes the linked bean inside the gated step, so one commit holds
  the code, the archived change, the changelog entry and the bean file together.
