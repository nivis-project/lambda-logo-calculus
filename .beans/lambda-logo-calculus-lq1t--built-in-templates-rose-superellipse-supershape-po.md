---
# lambda-logo-calculus-lq1t
title: 'Built-in templates: rose, superellipse, supershape, polygon'
status: todo
type: epic
priority: normal
created_at: 2026-09-30T22:04:36Z
updated_at: 2026-09-30T22:04:44Z
parent: lambda-logo-calculus-eihe
blocked_by:
    - lambda-logo-calculus-kiee
---

Four more built-in templates registered against the same `ShapeTemplate`
interface the trefoil uses, proving the interface is general.

## Scope

- Rose: `r = A + cos(k theta)`, parameters A and lobes k from 2 to 12. Tests the
  symmetry setting.
- Superellipse: `abs(x/a)^n + abs(y/b)^n = 1`, parameters a, b, n.
- Supershape (Gielis): parameters m, n1, n2, n3, a, b.
- Rounded polygon: parameters sides, corner radius, star depth.
- Each declares its own safety metadata and parameter definitions.

## Todo

- [ ] Register the rose template
- [ ] Register the superellipse template
- [ ] Register the supershape template
- [ ] Register the rounded polygon template
- [ ] Safety metadata and warnings per template
- [ ] Golden snapshot per template against "Hamburgefonstiv 0123"
