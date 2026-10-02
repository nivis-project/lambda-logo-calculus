## ADDED Requirements

### Requirement: The port applies the amplitude floor everywhere

The port SHALL apply the amplitude floor of 1.15 wherever the curve is used: to
the shape as it is drawn, to the fit search, to the pen, and to the reshaping of
glyphs.

The mark and the letters SHALL therefore always be made of the same curve.

Below the floor the amplitude SHALL stop having an effect, and that SHALL be
reported as a safety limit holding, naming the value given and the value used.

The prototype applies the floor in one place only. Reproducing that would mean
reproducing a range in which the mark shows three petals, the nesting collapses
to nothing, and the letters are bent by a curve they are not drawn with. The
reasoning is in ADR 0002.

#### Scenario: Below the floor

- **WHEN** the amplitude is set below 1.15
- **THEN** every part of the drawing uses 1.15, and a safety limit is reported
  naming the value given and the value used

#### Scenario: The mark and the letters agree

- **WHEN** the amplitude is anywhere in its range
- **THEN** the curve the mark is drawn from and the curve the letters are bent
  by are the same

#### Scenario: Pushing a slider that is held

- **WHEN** the amplitude is moved while below the floor
- **THEN** nothing in the drawing changes, and the report says which limit is
  holding it

### Requirement: A curve is a registered template

The base curve SHALL be a registered module carrying its own parameters, its own
radius function, and its own symmetry.

A second curve SHALL be added by registering another module. A branch on the
curve's name SHALL be a defect.

#### Scenario: The trefoil is registered

- **WHEN** the template registry is read
- **THEN** the trefoil is in it, with its amplitude declared as a parameter

#### Scenario: A second curve

- **WHEN** another curve is registered
- **THEN** the fit search, the pen and the stages all work against it with no
  change

### Requirement: Every limit that bound a value is reported

Computing the nesting SHALL return, alongside the geometry, a report of every
safety limit that bound a value, naming the limit, the value given and the value
used.

The limits SHALL be the amplitude floor of 1.15, the perfect fit floor of 0.02,
the effective scale ceiling of 1.5, and the copy scale ceiling of 1.6.

#### Scenario: Nothing was bound

- **WHEN** no value meets a limit
- **THEN** the report is empty

#### Scenario: The fit floor holds

- **WHEN** the perfect fit falls below 0.02
- **THEN** 0.02 is used and the report names the limit and both values

#### Scenario: A copy is held at its ceiling

- **WHEN** a copy's scale would exceed 1.6
- **THEN** it is drawn at 1.6 and the report says so
