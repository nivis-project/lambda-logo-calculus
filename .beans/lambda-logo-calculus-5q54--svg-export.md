---
# lambda-logo-calculus-5q54
title: SVG export
status: todo
type: epic
created_at: 2026-10-02T10:40:44Z
updated_at: 2026-10-02T10:40:44Z
parent: lambda-logo-calculus-4ra4
---

Write the logo to an SVG file.

Chosen because it exercises the renderer seam: it proves the scene graph is real data that something other than the screen can read. If the exporter needs to reach back into the pipeline, or needs a DOM, the seam is not where the specs say it is.

## Scope

- An exporter reading only the scene graph.
- Stable ids, so the same scene exports byte for byte the same file.
- A comparison proving the exported file matches what the screen draws.

## Todo

- [ ] Spec the exporter seam before writing it
- [ ] Write the SVG exporter
- [ ] Prove the export matches the preview
