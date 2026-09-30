---
# lambda-logo-calculus-koee
title: Parametric nesting and curve validation
status: todo
type: epic
priority: normal
created_at: 2026-09-30T22:04:36Z
updated_at: 2026-09-30T22:04:44Z
parent: lambda-logo-calculus-eihe
blocked_by:
    - lambda-logo-calculus-lq1t
---

Nesting must work for templates that are not star-shaped polar curves. For
parametric templates, find the largest scale at which the rotated copy still
sits inside its parent by binary search with a point-in-polygon test.

## Scope

- Parametric nesting by binary search plus point-in-polygon.
- Validation on save: the curve closes, stays non-negative, and for polar
  nesting stays star-shaped around its centre.
- When validation fails, warn the designer and offer the parametric route.
- Memoisation extended to the parametric path.

## Todo

- [ ] Implement point-in-polygon and the binary search for maximum copy scale
- [ ] Implement curve validation: closure, non-negativity, star-shapedness
- [ ] Warn and offer the parametric route when polar nesting does not apply
- [ ] Extend memoisation to parametric nesting
- [ ] Property test: a nested copy never crosses its parent outline
