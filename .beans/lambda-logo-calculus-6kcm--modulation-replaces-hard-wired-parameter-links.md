---
# lambda-logo-calculus-6kcm
title: Modulation replaces hard-wired parameter links
status: completed
type: epic
priority: normal
created_at: 2026-09-30T22:04:36Z
updated_at: 2026-10-01T10:44:57Z
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

- [x] Define the modulation entry and its evaluation
- [x] Implement the source set
- [x] Implement targeting of stage, ending and lockup parameters
- [x] Ship the prototype's links as the default preset
- [x] Build the modulation list UI
- [x] Test that the default preset reproduces the prototype's behaviour

## Summary of Changes

The two links the prototype kept to itself are now entries a designer owns. 420
unit tests, 34 browser tests.

- A modulation entry carries a source, a target, an amount and a response, and
  is project state, so it serialises and it undoes.
- Five sources, each normalised to 0 to 1: a template parameter, a nesting
  value, the copy index, the character's position, and a seeded random value. A
  single copy or a single character gives 0 rather than dividing by zero, and a
  source that cannot be read is reported rather than silently treated as zero.
- Five curves, each mapping 0 to 0 and 1 to 1, with a property test confirming
  none escapes that range anywhere.
- **The default preset reproduces the prototype exactly.** Checked across five
  amplitudes and five fit sizes, to floating point equality, not a tolerance.
  The parity recording and all five golden snapshots are unchanged.

One design decision worth stating. The prototype's width response is
`0.78 + 0.5 (1 - e^-((A-1)/4))`, which is not a normalised source through any
generic curve. Forcing it into one would have changed the output and broken
parity. An entry's response is therefore either a generic curve or a *named
transfer*, and the two prototype links use named transfers. The generic curves
serve the entries a designer adds. The amount blends between the unmodulated
value and the full response, so zero leaves the target alone and a half lands
halfway, which is tested.

One combination is refused rather than silently doing nothing. The stages run
once per glyph, before the copies are made, so a stage parameter cannot vary by
copy. An entry driving a stage parameter from the copy index is reported with
that reason instead of quietly producing zero. The browser test that exposed
this was passing against a target nothing consumed.

That led to the other half of the wiring: `evaluateModulation` was computing
stage parameter contributions that never reached `runStages`. The pipeline now
takes per-stage overrides, and `buildScene` evaluates modulation per glyph, so
the character position genuinely drives a stage parameter.

Capability `modulation` is a main spec with seven requirements and twenty-three
scenarios. `skeleton-stages` gained the override requirement and had the
Proportions stage's requirement rewritten: it reads its two values rather than
computing them.

OpenSpec change archived as `2026-10-01-add-modulation`.
