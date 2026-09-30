---
# lambda-logo-calculus-6kcm
title: Modulation replaces hard-wired parameter links
status: todo
type: epic
priority: normal
created_at: 2026-09-30T22:04:36Z
updated_at: 2026-09-30T22:04:45Z
parent: lambda-logo-calculus-ujb5
blocked_by:
    - lambda-logo-calculus-mvrv
---

Replace the prototype's hidden links between parameters with an editable list a
designer controls.

## Scope

- A modulation entry: a source drives a target by an amount along a curve.
- Sources: any template parameter, copy index, character position in the word, a
  seeded random value.
- Targets: any stage, ending or lockup parameter.
- The prototype's links (A controls letter width, fit size controls x-height)
  ship as the default preset.
- Designers add, remove and retarget entries.

## Todo

- [ ] Define the modulation entry and its evaluation
- [ ] Implement the source set
- [ ] Implement targeting of stage, ending and lockup parameters
- [ ] Ship the prototype's links as the default preset
- [ ] Build the modulation list UI
- [ ] Test that the default preset reproduces the prototype's behaviour
