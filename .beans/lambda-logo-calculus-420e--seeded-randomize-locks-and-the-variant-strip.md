---
# lambda-logo-calculus-420e
title: Seeded randomize, locks and the variant strip
status: todo
type: epic
priority: normal
created_at: 2026-09-30T22:04:36Z
updated_at: 2026-09-30T22:04:45Z
parent: lambda-logo-calculus-02i9
blocked_by:
    - lambda-logo-calculus-5w79
---

Randomize that respects locks and never loses a good result.

## Scope

- Randomize driven by the `randomize` range on each `ParamDef`.
- Locked parameters are never touched.
- The seed is stored in the project, so a random result is reproducible.
- Every randomize result is added to the variant strip.
- Variants can be compared side by side and restored.

## Todo

- [ ] Implement randomize from parameter definitions
- [ ] Respect locks
- [ ] Store the seed in the project
- [ ] Add each result to the variant strip
- [ ] Side-by-side variant comparison and restore
- [ ] End-to-end test: lock a value, randomize, confirm it did not move
