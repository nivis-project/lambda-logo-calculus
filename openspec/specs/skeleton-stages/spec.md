# skeleton-stages Specification

## Purpose
Between a declarative glyph skeleton and the pen that strokes it sit the
transformations that give the letterforms their character: arcs warped by the
base curve, bowls built from it, straight runs bowed by it, and proportions
driven by it. This capability defines those transformations as an ordered list
of pure, switchable functions.

## Requirements

### Requirement: A stage is pure and reads only its context

A stage SHALL be a registered module with a pure `apply(skeleton, context)`. It
SHALL read nothing outside its two arguments: no global state, no parameter it
was not given, no result of a later stage.

The context SHALL carry the resolved template, its resolved parameters, the
rotation between copies, the nesting result, the grid metrics and the current
modulation values.

#### Scenario: A stage is applied twice with the same inputs

- **WHEN** a stage is applied twice to equal skeletons with equal contexts
- **THEN** both results are equal

#### Scenario: A stage does not mutate its input

- **WHEN** a stage is applied to a skeleton
- **THEN** the skeleton passed in is unchanged afterwards

#### Scenario: A stage is switched off

- **WHEN** a stage is disabled in the stage list
- **THEN** the pipeline skips it entirely and passes the skeleton through
  untouched

### Requirement: Stages run in a fixed order and never look forward

The pipeline SHALL run the stages in list order: curves, bowls, bend,
proportions, split. A stage SHALL NOT read the output of a stage that runs after
it.

Splitting runs last, because the turns it measures are the ones the bend and
proportions stages leave behind, and because the stroker works on the runs it
produces.

#### Scenario: The default order is applied

- **WHEN** the default stage list is run
- **THEN** the stages apply in the order curves, bowls, bend, proportions, split

#### Scenario: The list is reordered

- **WHEN** two stages are swapped in the list
- **THEN** the pipeline applies them in the new order

### Requirement: The Curves stage warps arcs by the base curve

The Curves stage SHALL replace each declarative arc in a stroke with sampled
points, scaling each sample's radius by the base curve's radius at that angle
divided by the linear interpolation between the base curve's radius at the arc's
two end angles.

The scaling SHALL be clamped between a declared minimum and maximum, defaulting
to 0.5 and 1.5.

Because the divisor is the interpolation between the endpoint radii, the scaling
SHALL be 1 at both ends of the arc, so a warped arc still meets the stems it
joins.

#### Scenario: An arc keeps its endpoints

- **WHEN** an arc is warped by the Curves stage
- **THEN** its first and last sampled points lie where the unwarped arc's
  endpoints lie, to within tolerance

#### Scenario: The warp is bounded

- **WHEN** an arc is warped with any amplitude and rotation
- **THEN** no sample's radius scaling falls below the declared minimum or rises
  above the declared maximum

#### Scenario: The stage is off

- **WHEN** the Curves stage is disabled
- **THEN** arcs are still sampled into points, but with no warping applied

#### Scenario: A stroke of points only

- **WHEN** a stroke containing no arc passes through the Curves stage
- **THEN** its points are unchanged

### Requirement: The Bowls stage builds a counter from the base curve

The Bowls stage SHALL replace each bowl with a ring sampled from the base curve,
scaled by `max(floor, r(theta - rotation - a quarter turn) / maximum radius)`
where `floor` defaults to 0.35, then fitted into the bowl's ellipse inset on
each side by the inset parameter, which defaults to 5.

Where a cut region covers part of the ring, that part SHALL be removed and the
ring SHALL become one or more open runs. A ring with no cut SHALL stay closed.

#### Scenario: A bowl with no cut stays closed

- **WHEN** the glyph `o` passes through the Bowls stage
- **THEN** it yields one closed ring and no open run

#### Scenario: A bowl with a cut opens

- **WHEN** the glyph `c` passes through the Bowls stage
- **THEN** it yields at least one open run and no closed ring

#### Scenario: A counter stays open

- **WHEN** any bowl passes through the stage with any amplitude and rotation
- **THEN** the ring it produces encloses an area above zero, so the counter is
  not collapsed

#### Scenario: The ring fits the declared box and fills it

- **WHEN** a bowl of radii rx and ry is built
- **THEN** every point of the ring lies within the box the bowl declares, inset
  by the inset parameter on each side
- **AND** the ring touches all four sides of that box, because it is normalised
  by its own extent before being fitted

#### Scenario: The stage is off

- **WHEN** the Bowls stage is disabled
- **THEN** bowls are still built, as plain ellipses with no base-curve scaling

### Requirement: The Bend stage bows straight runs

The Bend stage SHALL bow each segment of an open run perpendicular to itself,
with an amplitude proportional to the segment's length, to a declared bend
factor defaulting to 0.22, and to the base curve's direction at the segment's
angle, divided by the amplitude parameter.

A segment shorter than a declared threshold, defaulting to 8, SHALL be left
straight. The bow SHALL follow a half sine, so it is zero at both ends of the
segment.

#### Scenario: A bent segment keeps its endpoints

- **WHEN** a segment is bent
- **THEN** its first and last points are where they were

#### Scenario: A short segment is left alone

- **WHEN** a segment shorter than the threshold is processed
- **THEN** it is unchanged

#### Scenario: The stage is off

- **WHEN** the Bend stage is disabled
- **THEN** every run passes through unchanged

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

### Requirement: Every tunable value is a named parameter

No transformation SHALL contain a numeric constant that a designer cannot see.
The bowl inset, the bowl radius floor, the bend factor, the bend threshold, the
bend sample count, the corner threshold, the run-split threshold and the arc
warp bounds SHALL each be a parameter definition with the prototype's value as
its default.

#### Scenario: The defaults match the prototype

- **WHEN** the built-in stages are listed with their parameter defaults
- **THEN** the bowl inset is 5, the bowl radius floor is 0.35, the bend factor
  is 0.22, the bend threshold is 8, the bend sample count is 12, the corner
  threshold is 50 degrees, the run-split threshold is 25 degrees, and the arc
  warp is bounded by 0.5 and 1.5

#### Scenario: A parameter is changed

- **WHEN** the bend factor is set to zero
- **THEN** no run is bent, without the stage being disabled

### Requirement: The Split stage breaks runs at sharp turns

A run SHALL be split into separate runs wherever it turns by more than a
declared threshold, defaulting to 25 degrees. Splitting SHALL happen after every
stage that reshapes a run, so the turn measured is the one the stroker will see.

The two runs on either side of a split SHALL share the point they were split at,
so no gap appears between them.

#### Scenario: A run with a sharp turn

- **WHEN** a run that turns by more than the threshold passes through the Split
  stage
- **THEN** it becomes two runs
- **AND** the last point of the first equals the first point of the second

#### Scenario: A run with no sharp turn

- **WHEN** a run that never turns by more than the threshold passes through
- **THEN** it is returned as one run, unchanged

#### Scenario: A run too short to turn

- **WHEN** a run of two points passes through
- **THEN** it is returned unchanged, because two points cannot turn

#### Scenario: The threshold is raised above every turn

- **WHEN** the threshold is set to 180 degrees
- **THEN** no run is split

### Requirement: A stage parameter can be modulated per glyph

The stage pipeline SHALL accept per-stage parameter overrides alongside the
stage list, and SHALL merge them over the values the stage list declares.

#### Scenario: A stage parameter is overridden

- **WHEN** the pipeline is given an override for a stage's parameter
- **THEN** that stage runs with the overridden value

#### Scenario: No override is given

- **WHEN** no override is given for a stage
- **THEN** it runs with the values its list entry declares
