---
# lambda-logo-calculus-4x3k
title: Parameters, registries and the seeded random source
status: completed
type: epic
priority: normal
created_at: 2026-10-02T11:09:09Z
updated_at: 2026-10-02T11:12:32Z
parent: lambda-logo-calculus-bmm5
openspec-link: openspec/changes/archive/2026-10-02-add-params-registry-and-seed
---

Parameters declared as data, a typed registry per extension point, and randomness that comes from a stored seed.

The prototype's randomize draws from an unseeded source, which milestone 02 recorded as a defect. The port chooses differently, and says so.

## Todo

- [ ] Define a parameter as data: id, kind, range, default, lockable, randomisable
- [ ] Resolve and validate values against definitions, reporting what was clamped
- [ ] A typed registry that refuses a duplicate id
- [ ] A seeded random source, reproducible for the same seed
