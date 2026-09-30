# Trefoil Studio briefing

Sep 30, 2026 · @Pim Snel (prive)

## Purpose and scope

Rebuild the single-file prototype (trefoil-type.html) as Trefoil Studio: a full-screen logo creator where a designer picks a base shape, and both the mark and the wordmark's letters are generated from that one piece of math. This first build is about a clean, extensible foundation, not feature count.

The prototype already proves these parts work, and the rebuild must reproduce them:

- A shape primitive: nested, rotated copies of r = A + cos 3θ, scaled by perfectFit and effectiveScale.
- An alphabet (a-z, A-Z, 0-9 and basic punctuation) built as skeletons on a shared grid (baseline, x-height, cap-height, descender).
- Shape-driven letterforms, each switchable: curves, bowls, bent strokes, proportions, looped joins, pen nib and shape endings.
- Nine stroke endings (round, flat, angled, tapered, flared, wedge, slab, hairline, ball), each with a plain and a shape-built version.
- Two drawing modes (shape as pen; plain pen with ornaments), six palettes, transparency, locks and randomize.
- A mark-plus-wordmark lockup that places the mark by its real outline, with distance, height and size controls, and switches to a stacked layout when space runs out.

The user is one designer at a large screen (1440 px wide and up) with mouse and keyboard. The outputs are logo files (SVG, PNG, PDF) and a project file that reopens exactly as saved.

Out of scope for the first release: accounts, real-time collaboration, editing on phones and exporting installable font files. The architecture should leave room for all of them.

## Guiding principles

The core decision: all geometry lives in a pure, framework-free core, and everything else (UI, renderer, exporters, even the tech stack) plugs into it. That is what makes features easy to add and the stack easy to change.

1. **Pure geometry core.** Math and glyph construction are pure functions from parameters to geometry in font units. No DOM, no rendering, no global state. The same input always gives the same output; randomness only comes from a stored seed.
2. **Renderers are adapters.** The core produces a scene graph (paths, fills, opacity, groups, transforms). SVG, Canvas or WebGL renderers and all exporters only read that scene graph.
3. **Everything is data.** Shape templates, glyph skeletons, pipeline settings, palettes and endings are JSON-serialisable definitions checked against schemas. A project file is just that data plus a version number.
4. **Features are registrations.** A new ending, pipeline stage, template, palette or exporter is added by registering one module with a typed interface. No growing switch statements.
5. **Parameters are first-class.** Every tunable value is a parameter definition with id, type, range, default, lockable and randomisable flags. Panels, locks and randomize are generated from these definitions.
6. **One store, every change a command.** All edits go through commands, so undo, redo, autosave and variant snapshots come for free.
7. **A speed budget.** A 20-character wordmark re-renders in under 16 ms at default settings while dragging a slider.

Working agreement for Claude Code:

- Write a short architecture decision record (ADR) in `docs/adr/` before each stack or structural choice.
- Keep the core package free of UI and framework dependencies; enforce it with a lint rule.
- Port prototype behaviour first, with snapshot tests, before changing it.
- Work phase by phase (see the delivery plan); don't build later-phase features early.
- When the brief is ambiguous, stop and ask rather than guess.

## Architecture

The studio is a one-way pipeline: parameters go in at the top, a scene graph comes out at the bottom, and every stage in between is a registered, replaceable module.

&#91;embedded content: architecture · core pipeline, registries, renderers\]

Only the store talks to the core, and only renderers and exporters read the scene graph; registries plug modules into any pipeline step.

Pipeline order, each step a pure function:

1. **Shape template**: parameters to a closed curve (see Base math as templates).
2. **Nesting**: the curve plus copy index to a transform per copy (today: perfectFit and effectiveScale).
3. **Glyph set**: a character to its skeleton (strokes, bowls, dots, cut regions) on grid metrics.
4. **Skeleton stages**: an ordered, user-reorderable list that reshapes skeletons (curves, bowls, bend, proportions and future ones).
5. **Stroker**: each skeleton run plus the pen (nib) of each pass to outline polygons.
6. **Endings and joins**: free stroke ends and corners to extra geometry.
7. **Style**: palette, opacity and blend per pass.
8. **Layout**: mark and text to positions (side or stacked lockup, line wrapping, kerning).
9. **Scene graph**: the result, read by renderers and exporters.

Suggested core types, as a starting point for Claude Code to refine:

```ts
type ParamDef = { id: string; label: string; kind: 'number'|'int'|'angle'|'enum'|'bool'|'color';
  min?: number; max?: number; step?: number; options?: string[]; default: unknown;
  lockable: boolean; randomize?: { min: number; max: number } | false; group?: string };

interface Registered<P> { id: string; version: number; label: string; params: ParamDef[]; }

interface ShapeTemplate extends Registered<TemplateParams> {
  kind: 'polar' | 'parametric';
  radius?(theta: number, p: TemplateParams): number;          // polar
  point?(t: number, p: TemplateParams): [number, number];      // parametric, t in [0,1)
  symmetry?: number;                                          // e.g. 3 for the trefoil
  safety?: { minRadius?: number; maxCopyScale?: number; warn?(p: TemplateParams): string | null };
}

interface SkeletonStage extends Registered<StageParams> {
  apply(sk: GlyphSkeleton, ctx: StageContext): GlyphSkeleton;  // pure
}

interface Ending extends Registered<EndingParams> {
  build(end: EndContext, ctx: PassContext): SceneNode[];       // point, direction, half-widths, pass index
}

interface Renderer { mount(el: HTMLElement): void; draw(scene: Scene): void; hitTest?(x: number, y: number): NodeRef | null; }
interface Exporter extends Registered<ExportParams> { run(scene: Scene, opts: ExportParams): Promise<Blob>; }
```

The `StageContext` passed to every stage holds the resolved template, the nesting result, grid metrics and the current modulation values. Stages never read global state; this replaces the prototype's hidden globals.

## Base math as templates

The base curve stops being hard-coded: the designer picks it from a template gallery, tunes its parameters, and can duplicate any template into an editable custom formula. Everything downstream (nesting, bowls, arc warping, bends, nib, endings, joins, mark) must go through the `ShapeTemplate` interface.

Today's template, kept as the default:

```latex
r(\theta) = A + \cos(3\theta), \qquad \text{perfectFit} = \min_{\theta} \frac{r(\theta)}{r(\theta - \varphi)}, \qquad s_i = \text{perfectFit}^{\,i\,(1 - 5f)}
```

Built-in templates for the first release:

| Template | Formula or idea | Parameters | Why include it |
| --- | --- | --- | --- |
| Trefoil (current) | r = A + cos 3θ | A (1-20) | Matches the prototype exactly |
| Rose | r = A + cos kθ | A, lobes k (2-12) | Generalises the trefoil; tests the symmetry setting |
| Superellipse | abs(x/a)^n + abs(y/b)^n = 1 | a, b, n | Squircles; very useful for sturdy logos |
| Supershape (Gielis) | r = (abs(cos(mθ/4)/a)^n2 + abs(sin(mθ/4)/b)^n3)^(−1/n1) | m, n1, n2, n3, a, b | Huge range of organic forms from one formula |
| Rounded polygon | n sides, corner radius | sides, radius, star depth | Geometric, badge-like marks |
| Custom formula | r(θ) or x(t), y(t) typed by the designer | user-defined | The open end of the system |

Rules for templates:

- **Nesting works for any template.** For polar templates, compute perfectFit numerically as today. For parametric ones, find the largest scale at which the rotated copy still sits inside its parent by binary search with a point-in-polygon test.
- **Safety is metadata, not magic numbers.** The prototype silently clamps A to 1.15 or more, perfectFit to 0.02 or more, copy scale to 1.6 or less, and bowl radius to 0.35 or more. These become per-template safety settings, shown to the designer as warnings.
- **Custom formulas are parsed, never run as code.** Use a restricted expression parser with a whitelist of functions (sin, cos, abs, pow, min, max, clamp, pi). Custom templates declare their own parameters, which then appear as sliders.
- **Validation on save:** the curve must close, stay non-negative, and (for polar nesting) stay star-shaped around its centre; otherwise the studio warns and offers the parametric nesting route.
- **Versioned in projects.** A project stores template id, version and parameters, and for custom templates the formula text itself, so a file always reopens identically.

The gallery shows a live thumbnail of each template using the project's current copies, rotation and palette, so a designer compares templates in context rather than in the abstract.

## Extension points

Eleven registries cover every feature the prototype has and the ones we can foresee; adding a feature should mean adding one file to one registry plus its tests.

| Extension point | Takes → returns | In the prototype | Worth adding later |
| --- | --- | --- | --- |
| Shape template | parameters → closed curve | Trefoil | Rose, superellipse, supershape, polygon, custom formula, imported SVG path |
| Nesting strategy | curve, copy index → transform | perfectFit, cumulative | Spiral offset, alternating flip, copies on a grid or ring |
| Glyph set | character → skeleton | Basic Latin, digits, 6 punctuation marks | Accents built from reusable parts, ligatures, alternates (one- or two-storey a and g) |
| Skeleton stage | skeleton + context → skeleton | Curves, bowls, bend, proportions | Seeded jitter, slant, weight and contrast axes, width axis |
| Stroker (pen) | run + nib → outline | Support-function offset | True Minkowski sum, broad-nib calligraphy, pressure curves |
| Ending | stroke end → geometry | 9 styles | Spurs, ink traps, endings made from any template |
| Join | corner → geometry | Loop of the shape | Rounded fillet, mitre, ink trap |
| Palette | copy index, count → colour | 6 schemes | Brand colours, imported palettes, gradients per pass |
| Lockup | mark outline + text block → positions | Side, stacked | Centred stack, enclosure or badge, text on a circle, monogram |
| Renderer | scene graph → screen | SVG strings | Canvas 2D, WebGL for many copies |
| Exporter | scene graph + options → file | none | SVG, PNG at 1×/2×/4×, PDF, favicon set, brand sheet, font file |

**Modulation replaces hard-wired links.** In the prototype, A secretly controls letter width and fit size controls x-height. Make this an editable modulation list: a source (any template parameter, copy index, character position in the word, a seeded random value) drives a target (any stage, ending or lockup parameter) by an amount and a curve. The prototype's links become the default preset, and designers can add, remove or retarget them.

**Every registration carries** an id, version, label, parameter definitions, the pure function, and optional UI hints (group, icon, advanced flag). The studio discovers registries at start-up, so a new module shows up in the panels without UI code changes.

**Per-glyph overrides.** Designers need to fix single letters: nudge a bowl, swap an ending, change a spacing pair. Store these as small patches on top of the generated skeleton, keyed by character, so they survive parameter changes.

## Refactoring map from the prototype

The prototype's math is sound and should be ported almost as-is; its structure (globals, string-built SVG, one big render function) is what gets replaced. Attach the prototype file to the repo as `reference/trefoil-type.html` and treat it as the behavioural spec.

| Prototype part | Problem | Action |
| --- | --- | --- |
| Global `state` object changed inside event handlers | UI and math are tangled; no undo | Typed store with commands and history |
| `buildGlyphs()`: literal coordinates plus `arc()` calls that read global state | Glyph data mixed with math; hidden inputs | Skeletons as JSON (line, arc, bowl, dot, cut region); arc warping moves into the Curves stage with an explicit context |
| `cos(3θ)` written out in `R()`, `rc()`, `shapeRho()` and `ringPts()` | Base shape can't change | Every use goes through the template interface |
| `glyphLetter()` and `glyphOrn()` as two separate pipelines | Duplicated logic | One pipeline; ornaments become a render style (stack-filled bowls, ornament endings) |
| SVG built as strings into `innerHTML`, mask ids from a global counter | Fragile ids, no reuse, no hit-testing | Scene graph objects; renderer assigns stable ids |
| Counters shown by SVG masks | Exports fail in some tools; can't be edited | Real holes via boolean path operations in export; masks allowed only in the live preview |
| Magic numbers: nib 6.5, bowl inset 5, loop radius 11, bend 0.22, optical 1.06, gap 0.6, taper and flare constants | Invisible to the designer | Named parameters with these defaults, shown under an Advanced toggle |
| Line wrapping and mark lockup inside `render()` | Layout mixed with drawing | Lockup registry returning positions |
| Lock and randomize written per slider | Every new slider needs new code | Generated from parameter definitions; seeded random, seed saved in the project |
| `perfectFit` recalculated (720 samples) on every change | Wasted work while dragging | Memoise by template, parameters and rotation |

Keep as proven: the perfectFit and effectiveScale nesting, the support-function stroker (offset per direction, 360-entry lookup), arc warping normalised so arcs still meet their stems, mark placement by real outline with 6% optical enlargement, flat serifs on vertical strokes, and balls only on curved ends.

## Tech stack guidance

The stack is still open; fix only TypeScript and a framework-free core now, and let Claude Code propose the rest in ADRs against the criteria below. Because the core never imports UI or rendering code, any later choice stays reversible.

Criteria for every choice: exports must match the screen exactly; live preview must hold the 16 ms budget with 12 copies × 20 glyphs; good libraries for path booleans and curve fitting; strong typing; easy to test headless.

Suggested repository shape (pnpm workspaces or similar):

```text
packages/core          pure TS: templates, nesting, glyph sets, stages, stroker, endings, lockup, scene graph
packages/render-svg    scene graph → SVG DOM (first renderer)
packages/render-canvas scene graph → Canvas 2D (fallback / speed)
packages/export        SVG, PNG, PDF exporters; path booleans and curve fitting
packages/templates     built-in template and glyph-set data (JSON + small TS modules)
apps/studio            the UI: panels, canvas, store, history, project files
docs/adr               one decision record per choice
reference/             prototype file used as behavioural spec
```

| Layer | Candidates | Notes |
| --- | --- | --- |
| Language and build | TypeScript (strict), Vite | Fixed |
| UI framework | React, Svelte or SolidJS | Panels are generated from parameter definitions, so the UI layer stays thin and replaceable |
| State and history | Zustand or a small custom store, with Immer patches for undo | Commands must be serialisable |
| Live preview | SVG DOM first; Canvas 2D or WebGL (PixiJS, regl) behind the same renderer interface | Switch when profiling shows SVG is too slow |
| Path booleans and offsets | Clipper2 (WASM), polygon-clipping, or paper.js | Needed for clean exports: unite passes, cut counters as real holes |
| Curve fitting | A polyline-to-Bézier fitter | Keeps exported SVG small and editable in Illustrator and Figma |
| Formula parsing | mathjs with a limited scope, or expr-eval | Never `eval` |
| Heavy work | Web Worker via Comlink | perfectFit, support tables, export |
| Export | Native SVG; PNG via canvas; PDF via svg2pdf.js or pdf-lib; later font files via opentype.js |  |
| Desktop app (optional, later) | Tauri | Only if file-system access or offline use becomes important |
| Tests | Vitest, fast-check (property tests), Playwright (visual snapshots) |  |

## Studio UI for a full-sized screen

The canvas takes the centre and most of the space; controls sit in panels ordered the way the pipeline runs, so shape settings are on the left and letter, colour and lockup settings on the right.

- **Top bar:** project name, undo and redo, variant snapshot, export.
- **Left panel, Shape:** template gallery with live thumbnails, template parameters, custom formula editor, nesting settings (copies, rotation, fit).
- **Centre, Canvas:** artboards for the mark alone, horizontal lockup and stacked lockup; zoom and pan; optional overlay layers for grid lines, skeletons, nib shape, outline bounds and the mark's optical box.
- **Right panel, Letters and lockup:** the stage list (switch on or off, reorder, per-stage parameters), endings and joins, modulation list, colour, lockup placement.
- **Bottom strip:** the text field, a small-size preview (16, 32, 64 and 128 px on light and dark backgrounds), and saved variants to compare side by side.

Interaction details that matter for designers:

- Every parameter shows a lock, its value, and a reset to default; double-click a slider to type an exact value.
- Randomize respects locks, and each result is added to the variant strip so good ones are not lost.
- Clicking a letter on the canvas opens its per-glyph overrides and spacing pairs.
- Keyboard shortcuts for undo, redo, zoom, toggling overlays and cycling variants.
- The whole state autosaves locally and exports as a single project file.

## Delivery plan

Work in five phases; Claude Code finishes each phase's gate, with tests, before starting the next. Phase 0 is deliberately about porting, not improving, so every later change can be checked against a known baseline.

&#91;embedded content: delivery plan · 5 phases, 5 gates\]

Each gate is the acceptance test for its phase; the diamonds mark where the designer reviews the build before work continues.

## Testing, performance and open questions

The core is tested like a maths library and the studio like a design tool: known values, invariants, and pictures that must not change by accident.

- **Known values:** perfectFit is 1 at rotation 0 and at 120° for the trefoil; effectiveScale equals perfectFit at fit size 0.
- **Invariants (property tests):** for random parameters, strokes that start on the baseline still end on it after every stage; bowl counters stay open; exported paths close and contain no NaN.
- **Golden snapshots:** each template × a fixed test string (for example "Hamburgefonstiv 0123") renders to a stored SVG; any change must be approved on purpose.
- **Parity with the prototype:** in phase 0, the ported core reproduces the prototype's output for the default settings within a small tolerance.
- **Speed:** measure every render; cache each glyph by a hash of the parameters it uses; while a slider is dragged, sample curves more coarsely and render full quality on release; move perfectFit, support tables and export into a worker.

Open questions to settle before or during phase 0:

- [ ] Is the output logos only, or should the alphabet also become a usable font file?
- [ ] Which UI framework (React, Svelte or SolidJS)?
- [ ] Web app only, or also a desktop app (Tauri) for local files?
- [ ] Open source from the start, and under which licence?
- [ ] Is a brand sheet export (mark, lockups, colours, clear space) needed in the first release?
