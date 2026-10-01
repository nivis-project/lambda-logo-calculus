## Purpose

The prototype wired two parameters to two others and told nobody. This
capability makes every such link a visible, editable entry, with the
prototype's own links as the starting set.

## ADDED Requirements

### Requirement: A modulation entry says what drives what, by how much

A modulation entry SHALL carry a source, a target, an amount and a response. It
SHALL be JSON-serialisable, because it is project state.

A response SHALL be either one of the generic curves, or a named transfer.

Named transfers exist because the prototype's two links are not expressible as a
normalised source through a generic curve. Its width response is
`0.78 + 0.5 (1 - e^-((A-1)/4))` and its x-height response is a capped linear
gain. Forcing either into a generic curve would change the output and break
parity, so each ships as a named transfer and the generic curves serve the
entries a designer adds.

An amount SHALL blend between the unmodulated value and the full response, so an
amount of 0 leaves the target alone and an amount of 1 applies the response in
full.

#### Scenario: An entry round-trips

- **WHEN** a modulation entry is serialised and parsed back
- **THEN** evaluating the parsed entry gives the same result

#### Scenario: An entry with no source value

- **WHEN** an entry names a source that has no value in the current context
- **THEN** evaluation reports it rather than producing a silent zero

### Requirement: The sources are declared, not arbitrary

A source SHALL be one of: a named template parameter, a nesting value, the copy
index, the character's position in the word, or a seeded random value.

Each source SHALL produce a number normalised to the range 0 to 1 before the
curve is applied, so an amount means the same thing whatever drives it.

#### Scenario: A template parameter drives

- **WHEN** a template parameter at the middle of its range drives an entry
- **THEN** the normalised source value is 0.5

#### Scenario: A nesting value drives

- **WHEN** the fit size at the middle of its range drives an entry
- **THEN** the normalised source value is 0.5

#### Scenario: A named transfer sees the unnormalised value

- **WHEN** a named transfer evaluates
- **THEN** it reads the source's own value, not the normalised one, because its
  formula is defined on that scale

#### Scenario: The copy index drives

- **WHEN** the copy index drives an entry across six copies
- **THEN** the first copy gives 0 and the last gives 1

#### Scenario: The character position drives

- **WHEN** the character position drives an entry across a word
- **THEN** the first character gives 0 and the last gives 1

#### Scenario: A seeded random drives

- **WHEN** a seeded random source drives an entry twice with the same seed and
  index
- **THEN** both give the same value, and it lies between 0 and 1

#### Scenario: A single copy or character

- **WHEN** there is only one copy, or one character
- **THEN** the source gives 0 rather than dividing by zero

### Requirement: The curve shapes the response

A curve SHALL be one of linear, ease in, ease out, ease in and out, or step.
Every curve SHALL map 0 to 0 and 1 to 1.

#### Scenario: Every curve passes through both ends

- **WHEN** each curve is evaluated at 0 and at 1
- **THEN** it gives 0 and 1

#### Scenario: Linear is the identity

- **WHEN** the linear curve is evaluated anywhere
- **THEN** it gives back what it was given

#### Scenario: Ease in starts slower than linear

- **WHEN** ease in is evaluated at 0.25
- **THEN** its value is below 0.25

#### Scenario: Every curve stays in range

- **WHEN** any curve is evaluated anywhere in 0 to 1
- **THEN** its value is in 0 to 1

### Requirement: The prototype's links ship as the default preset

The default modulation list SHALL contain two entries, each using a named
transfer: the amplitude driving the letter width factor, and the fit size
driving the x-height.

Evaluating the default preset SHALL produce exactly the values the Proportions
stage produced before modulation existed.

#### Scenario: The default preset matches the prototype

- **WHEN** the default preset is evaluated for the prototype's default settings
- **THEN** the width factor and the x-height equal what the prototype's formulas
  give, exactly

#### Scenario: The default preset matches across a range

- **WHEN** the default preset is evaluated across a spread of amplitudes and fit
  sizes
- **THEN** every pair matches the prototype's formulas exactly

### Requirement: A combination the pipeline cannot honour is refused

The stages run once per glyph, before the copies are made, so a stage
parameter cannot vary by copy. An entry whose source is the copy index and whose
target is a stage parameter SHALL be refused and reported, rather than silently
producing nothing.

#### Scenario: The copy index is pointed at a stage parameter

- **WHEN** an entry drives a stage parameter from the copy index
- **THEN** the target is left alone
- **AND** the evaluation reports why, naming that the stages run once per glyph

#### Scenario: The character position drives a stage parameter

- **WHEN** an entry drives a stage parameter from the character position
- **THEN** each glyph receives a different value for that parameter

### Requirement: A designer can change the links

Entries SHALL be addable, removable and retargetable. Removing the amplitude
entry SHALL stop the amplitude affecting the letter width.

#### Scenario: An entry is removed

- **WHEN** the entry driving the letter width is removed
- **THEN** changing the amplitude no longer changes the letter width

#### Scenario: An entry is retargeted

- **WHEN** an entry's target is changed
- **THEN** its source drives the new target and no longer the old one

#### Scenario: An entry's amount is changed

- **WHEN** an entry's amount is set to zero
- **THEN** its target is left at its unmodulated value

#### Scenario: An amount part way

- **WHEN** an entry's amount is set to one half
- **THEN** its target lands halfway between the unmodulated value and the full
  response

#### Scenario: Two entries drive one target

- **WHEN** two entries name the same target
- **THEN** their contributions combine in list order, deterministically
