## MODIFIED Requirements

### Requirement: The Proportions stage scales width and remaps height

The Proportions stage SHALL multiply every x coordinate by the width factor from
the context's modulation, and remap every y coordinate piecewise: unchanged at
or below the baseline, scaled linearly from the baseline to the modulated
x-height, scaled linearly from there to the cap-height, and unchanged above it.

The stage SHALL read both values from the context. It SHALL NOT compute them
from the amplitude or the fit size itself; the modulation list does that, and the
prototype's two links ship as its default preset.

#### Scenario: The baseline does not move

- **WHEN** a point on the baseline passes through the stage
- **THEN** its y coordinate is still zero

#### Scenario: The x-height maps to the modulated x-height

- **WHEN** a point at the x-height passes through the stage
- **THEN** its y coordinate is the modulated x-height

#### Scenario: The cap-height does not move

- **WHEN** a point at the cap-height passes through the stage
- **THEN** its y coordinate is still the cap-height

#### Scenario: The headroom does not bind within the slider range

- **WHEN** the modulated x-height is computed for any fit value the slider can
  produce
- **THEN** it equals the gain term, not the headroom cap

#### Scenario: The remap is monotonic

- **WHEN** two points with different y coordinates pass through the stage
- **THEN** their order in y is preserved

#### Scenario: The stage is off

- **WHEN** the Proportions stage is disabled
- **THEN** the width factor is 1 and the x-height is unmodulated, so every
  coordinate passes through unchanged

#### Scenario: The modulation list is empty

- **WHEN** no modulation entry targets the width factor or the x-height
- **THEN** the stage receives a width factor of 1 and the grid's own x-height

## ADDED Requirements

### Requirement: A stage parameter can be modulated per glyph

The stage pipeline SHALL accept per-stage parameter overrides alongside the
stage list, and SHALL merge them over the values the stage list declares.

#### Scenario: A stage parameter is overridden

- **WHEN** the pipeline is given an override for a stage's parameter
- **THEN** that stage runs with the overridden value

#### Scenario: No override is given

- **WHEN** no override is given for a stage
- **THEN** it runs with the values its list entry declares
