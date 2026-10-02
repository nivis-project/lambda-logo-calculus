## ADDED Requirements

### Requirement: A sampled glyph is a working skeleton

Running the stages SHALL produce a working skeleton: open runs of points, closed
rings of points, and dots with a centre and a radius.

Nothing in a working skeleton SHALL still need interpreting. An arc has been
sampled, a bowl has become a ring or runs, and a cut has been applied.

#### Scenario: A stem

- **WHEN** a glyph holding one straight stroke is run through the stages
- **THEN** the working skeleton holds one run and no rings

#### Scenario: A bowl

- **WHEN** a glyph holding an uncut bowl is run through the stages
- **THEN** the working skeleton holds one ring

#### Scenario: A cut bowl

- **WHEN** a glyph holding a bowl with a cut region is run through the stages
- **THEN** the working skeleton holds open runs rather than a ring

#### Scenario: A dot

- **WHEN** a glyph holding a dot is run through the stages
- **THEN** the working skeleton holds that dot, moved by the stages that move it

### Requirement: Each stage is a registered module with a switch

Each of the four stages SHALL be a registered module carrying an id, a label and
its own parameters, and SHALL be switchable on and off independently.

A stage SHALL read only its input, the glyph and the parameters it is given. A
stage SHALL NOT read a global, and SHALL NOT read the output of a stage that
runs after it.

#### Scenario: The four stages

- **WHEN** the stage registry is read
- **THEN** it holds the curves, bowls, bend and proportions stages

#### Scenario: A stage switched off

- **WHEN** a stage is switched off
- **THEN** its transformation does not apply, and the others are unchanged

#### Scenario: Every stage off

- **WHEN** all four are off
- **THEN** the working skeleton is the glyph sampled plainly, at its declared
  coordinates

### Requirement: The stages run in one order

The pipeline SHALL run the stages in the order curves, bowls, bend, proportions.

#### Scenario: The order

- **WHEN** the pipeline runs
- **THEN** the stages run in that order

#### Scenario: A reordered list

- **WHEN** the stage list is given in a different order
- **THEN** the pipeline runs it in the order given, so the order is data rather
  than a rule in the code

### Requirement: A stroke that starts on the baseline ends on the baseline

For any parameters, a point that sits on the baseline before the stages SHALL
sit on the baseline after them.

Letters that do not meet the baseline are not letters, and this is the invariant
the bend and proportions stages are both written to preserve.

#### Scenario: Any parameters

- **WHEN** a glyph with a point on the baseline is run through the stages, for
  any amplitude, rotation and fit size
- **THEN** that point is still on the baseline

#### Scenario: A descender

- **WHEN** a point sits below the baseline
- **THEN** the proportions stage leaves its height alone

### Requirement: A bowl's counter stays open

For any parameters, a bowl SHALL enclose an area. A bowl that closes to nothing
is a letter with no counter.

#### Scenario: Any parameters

- **WHEN** a bowl is traced for any amplitude and rotation
- **THEN** the ring encloses a positive area

#### Scenario: The radial floor holds it open

- **WHEN** the curve's radius would pinch the ring to a point
- **THEN** the floor of 0.35 keeps it open
