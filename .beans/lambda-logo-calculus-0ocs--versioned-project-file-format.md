---
# lambda-logo-calculus-0ocs
title: Versioned project file format
status: completed
type: epic
priority: normal
created_at: 2026-09-30T22:04:36Z
updated_at: 2026-10-01T11:17:02Z
parent: lambda-logo-calculus-ujb5
blocked_by:
    - lambda-logo-calculus-efhp
---

A project file is the data plus a version number, and it reopens exactly as it
was saved.

## Scope

- A versioned, JSON-serialisable project format holding template id, version and
  parameters, custom formula text, stage list and parameters, modulation
  entries, per-glyph overrides, spacing pairs, palette, lockup settings, text and
  the random seed.
- Schema validation on load, with a clear message on a mismatch.
- A migration path for a future version bump.
- Save to a file and load from a file; autosave restores on reopen.

## Todo

- [ ] Define the project schema and version number
- [ ] Serialise every piece of state listed in the scope
- [ ] Validate on load and report mismatches clearly
- [ ] Add the migration hook for future versions
- [ ] Save to and load from a file
- [ ] End-to-end test: save, reload, confirm an identical scene graph
