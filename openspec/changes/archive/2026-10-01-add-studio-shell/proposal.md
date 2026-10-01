## Why

Epic [lambda-logo-calculus-9szv](../../../.beans/lambda-logo-calculus-9szv--studio-shell-canvas-artboards-and-overlays.md),
under milestone 04 Studio shell and parameter UI.

There is a store and a renderer, and the page that joins them is forty lines of
imperative DOM. That was right for proving the pipeline; it is not a studio.

The brief describes a specific layout, and the reason it is specific is that the
panels follow the pipeline: shape settings on the left where the pipeline starts,
letters and lockup on the right where it ends, canvas in the middle taking most
of the space. A designer reading left to right is reading the pipeline.

This epic builds that shell, the canvas with its three artboards, the overlay
layers, the small-size preview and the keyboard shortcuts. The controls that
fill the panels come next; this is the frame they go in.

## What Changes

- Add React to `apps/studio`, per ADR 0003, with a hook binding the store.
- Add the shell: top bar, left panel, centre canvas, right panel, bottom strip.
- Add three artboards: the mark alone, the horizontal lockup, the stacked lockup.
- Add zoom and pan on the canvas, with a reset.
- Add overlay layers: grid lines, skeletons, nib shape, outline bounds, and the
  mark's optical box, each switchable.
- Add the bottom strip: the text field, and a small-size preview at 16, 32, 64
  and 128 pixels on light and dark.
- Add keyboard shortcuts for undo, redo, zoom and toggling overlays.
- Add the undo and redo buttons in the top bar, disabled when there is nothing
  to do.

## Capabilities

### New Capabilities

- `studio-shell`: the layout, the artboards, the overlays and the shortcuts.

### Modified Capabilities

- `quality-gate`: the end-to-end suite moves out of the Nix sandbox and into the
  dev shell, still run by the ship script before anything is archived. ADR 0009
  records why and what was ruled out.

## Impact

- New dependencies in `apps/studio` only: react, react-dom and their types. The
  core boundary check already fails if react reaches `packages/core`, and that
  rule is what makes adding it here safe.
- The renderer is imperative and React is declarative, so the canvas is a React
  component that owns a plain DOM node and hands it to the renderer. React never
  manages the SVG it produces.
- The three artboards each need their own scene, so the scene builder is called
  once per artboard rather than once per render. Memoising that is a milestone
  06 concern; the budget benchmark is where it belongs.
- Overlays draw from the same geometry the pipeline already produces. The
  skeleton overlay in particular needs the working skeleton, which the scene
  builder currently discards, so it gains a way to report it.
- The parameter panels are deliberately out of scope. They are generated from
  `ParamDef`s and that is the next epic.
- Lockup placement is out of scope too. The three artboards exist and each
  redraws, but the horizontal and stacked ones show the same wordmark until the
  lockup registry lands in milestone 05. The spec says so rather than implying a
  capability that is not there.
