---
# lambda-logo-calculus-efhp
title: Per-glyph overrides and spacing pairs
status: todo
type: epic
priority: normal
created_at: 2026-09-30T22:04:36Z
updated_at: 2026-09-30T22:04:45Z
parent: lambda-logo-calculus-ujb5
blocked_by:
    - lambda-logo-calculus-6kcm
---

Designers need to fix single letters without disturbing the rest.

## Scope

- Per-glyph overrides stored as small patches on top of the generated skeleton,
  keyed by character, so they survive parameter changes.
- Spacing pairs, also stored per pair.
- Clicking a letter on the canvas opens its overrides.
- Overrides are data, serialised into the project file.

## Todo

- [ ] Define the per-glyph patch format
- [ ] Apply patches after the stage list, before the stroker
- [ ] Define and apply spacing pairs
- [ ] Open overrides by clicking a letter on the canvas
- [ ] Property test: an override survives a template parameter change
