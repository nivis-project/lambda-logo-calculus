---
# lambda-logo-calculus-kk6s
title: SVG, PNG and PDF exporters
status: todo
type: epic
priority: normal
created_at: 2026-09-30T22:04:36Z
updated_at: 2026-09-30T22:04:45Z
parent: lambda-logo-calculus-yp20
blocked_by:
    - lambda-logo-calculus-txdw
---

The three file formats a designer hands over, each registered against the same
`Exporter` interface.

## Scope

- SVG: native output, stable ids, no masks.
- PNG at 1x, 2x and 4x, rendered through canvas.
- PDF.
- Each exporter is a registration with its own parameter definitions, so the
  export dialog is generated, not hand-written.
- Exports must match the screen exactly.

## Todo

- [ ] Define the `Exporter` interface and registry
- [ ] Register the SVG exporter
- [ ] Register the PNG exporter at 1x, 2x and 4x
- [ ] Register the PDF exporter
- [ ] Generate the export dialog from parameter definitions
- [ ] End-to-end test: exported SVG matches the rendered preview
