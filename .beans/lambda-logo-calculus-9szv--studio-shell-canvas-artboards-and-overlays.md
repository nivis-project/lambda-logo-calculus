---
# lambda-logo-calculus-9szv
title: Studio shell, canvas, artboards and overlays
status: todo
type: epic
priority: normal
created_at: 2026-09-30T22:04:36Z
updated_at: 2026-09-30T22:04:45Z
parent: lambda-logo-calculus-02i9
blocked_by:
    - lambda-logo-calculus-buo8
---

The studio shell: a top bar, a left Shape panel, a centre canvas, a right
Letters and lockup panel, and a bottom strip, laid out for a screen of 1440 px
or wider.

## Scope

- Top bar: project name, undo, redo, variant snapshot, export.
- Centre canvas with three artboards: mark alone, horizontal lockup, stacked
  lockup. Zoom and pan.
- Overlay layers: grid lines, skeletons, nib shape, outline bounds, optical box.
- Bottom strip: the text field and a small-size preview at 16, 32, 64 and 128 px
  on light and dark backgrounds.
- Keyboard shortcuts for undo, redo, zoom, toggling overlays and cycling
  variants.

## Todo

- [ ] Build the shell layout
- [ ] Build the canvas with artboards, zoom and pan
- [ ] Build the overlay layers
- [ ] Build the bottom strip with the small-size preview
- [ ] Wire the keyboard shortcuts
- [ ] End-to-end test: type a word, see it render on all three artboards
