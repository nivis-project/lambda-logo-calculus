## Why

Epic [lambda-logo-calculus-6kcm](../../../.beans/lambda-logo-calculus-6kcm--modulation-replaces-hard-wired-parameter-links.md),
under milestone 05 Lockup, modulation and project files.

Two links in the prototype are invisible to the designer. The amplitude secretly
controls letter width, and the fit size secretly controls the x-height. A
designer who drags the amplitude slider watches the letters get wider and has no
way to know why, or to stop it.

The brief names this directly: modulation replaces hard-wired links. A source
drives a target by an amount along a curve, the prototype's two links ship as
the default preset, and a designer can add, remove or retarget them.

The Proportions stage currently computes both formulas itself, which is what
parity required. With parity established and the snapshots in charge, the
formulas can become what they always were: two entries in a list.

## What Changes

- Add a modulation entry: a source, a target, an amount and a curve.
- Add the sources: any template parameter, the copy index, the character's
  position in the word, and a seeded random value.
- Add the targets: any stage, ending or lockup parameter, plus the two the
  Proportions stage consumes.
- Add the curves: linear, ease in, ease out, ease in and out, and a step.
- Ship the prototype's two links as the default preset, so the default project
  behaves exactly as it does now.
- Evaluate modulation into the stage context, so the Proportions stage reads
  values rather than computing them.
- Add the modulation list to the studio: add, remove, retarget and set the
  amount.

## Capabilities

### New Capabilities

- `modulation`: what a modulation entry is, what may drive what, and how the
  prototype's links are expressed as entries.

### Modified Capabilities

- `skeleton-stages`: the Proportions stage reads its width factor and x-height
  from the context's modulation rather than computing them from the amplitude
  and fit size itself.

## Impact

- New under `packages/core/src/modulation`.
- The default preset must reproduce the prototype's output exactly. The parity
  recording and every golden snapshot are the check, and neither may move.
- Sources that vary per copy or per character mean modulation is evaluated more
  than once per render. The context already carries the copy index where it is
  needed; the character position is new.
- A modulation list is project state, so it is serialisable and it undoes.
