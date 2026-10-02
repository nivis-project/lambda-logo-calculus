# shape-and-nesting Specification

## Purpose
The one piece of mathematics everything else is drawn from: the base curve, how
far a rotated copy can shrink and still fit inside its parent, and the limits
that keep both from running away.

## Requirements

### Requirement: The base curve

The base curve SHALL be the polar curve `r(t) = A + cos(3t)`, where `A` is the
amplitude control. It SHALL be sampled at 144 points for drawing, at equal steps
in `t` over a full turn.

For drawing, the radius SHALL be normalised by `A + 1`, which is the curve's
maximum, so the shape always fits a unit circle whatever the amplitude is.

#### Scenario: The curve at the default amplitude

- **WHEN** the amplitude is 3
- **THEN** the radius runs between 2 and 4, and the normalised radius between
  0.5 and 1

#### Scenario: Three-fold symmetry

- **WHEN** the curve is evaluated at `t` and at `t + 120 degrees`
- **THEN** the two radii are equal

#### Scenario: The cusp at the bottom of the range

- **WHEN** the amplitude is 1
- **THEN** the radius reaches 0, and the drawn shape has three cusps rather than
  three lobes

### Requirement: The fit is the largest a rotated copy can be

The perfect fit SHALL be the smallest ratio of the curve to a copy of itself
rotated by the rotation angle, taken over a full turn:
`min over t of r(t) / r(t - phi)`.

It SHALL be computed by sampling 720 points over the turn. A sample whose
denominator is at or below `1e-9` SHALL be skipped rather than divided by. When
no sample yields a finite value the fit SHALL be 1, and a negative result SHALL
be raised to 0.

#### Scenario: No rotation

- **WHEN** the rotation is 0
- **THEN** the fit is 1, because the copy is the curve

#### Scenario: A third of a turn

- **WHEN** the rotation is 120 degrees
- **THEN** the fit is 1, because the curve has three-fold symmetry

#### Scenario: A denominator at zero

- **WHEN** a sample's denominator is at or below 1e-9
- **THEN** that sample is skipped and does not produce an infinity

### Requirement: The fit size bends the scale between the copies

The effective scale SHALL be `perfectFit ^ (1 - 5 * fit)`, so a fit size of 0
leaves the perfect fit as the scale, a negative fit size shrinks each copy
faster and a positive one shrinks it more slowly or grows it.

Copy `i` of `n` SHALL be drawn at `effectiveScale ^ i`, rotated by `i` times the
rotation angle.

#### Scenario: Fit size at zero

- **WHEN** the fit size is 0
- **THEN** the effective scale equals the perfect fit

#### Scenario: Fit size pushes the scale above one

- **WHEN** the fit size is high enough that the effective scale exceeds 1
- **THEN** each copy is larger than the one before it

### Requirement: Four safety limits bound the nesting

The following limits SHALL apply, and SHALL be recorded as safety limits rather
than left as arithmetic:

| limit                      | value | what it bounds                        |
| -------------------------- | ----- | ------------------------------------- |
| perfect fit floor          | 0.02  | the base of the effective scale power |
| effective scale ceiling    | 1.5   | the effective scale itself            |
| copy scale ceiling         | 1.6   | the scale of any individual copy      |
| amplitude floor            | 1.15  | the amplitude used to reshape glyphs  |

Each SHALL be applied silently in the prototype. The port SHALL record which
limit bound a value and what it would otherwise have been, because a shape that
has quietly stopped responding to a slider is indistinguishable from a broken
one.

#### Scenario: The fit falls below its floor

- **WHEN** the perfect fit is below 0.02
- **THEN** 0.02 is used, and the fact that the limit bound it is reported

#### Scenario: A copy would exceed its ceiling

- **WHEN** the effective scale raised to a copy's index exceeds 1.6
- **THEN** that copy is drawn at 1.6

#### Scenario: Pushing a bound slider

- **WHEN** a slider is moved while its value is bound by a limit
- **THEN** the drawing does not change, and the report says which limit is
  holding it

### Requirement: The amplitude floor applies to the letters and not to the shape

The prototype SHALL be recorded as applying the amplitude floor of 1.15 only
where the curve reshapes a glyph, and not where the curve is drawn or where the
fit is computed.

Below an amplitude of 1.15 the mark is therefore drawn from one curve and the
letters are reshaped by a different one. The nesting is computed from the first.

This is a defect, recorded as the prototype's behaviour. The port SHALL decide
deliberately whether to reproduce it, and SHALL say which it chose.

#### Scenario: Below the floor

- **WHEN** the amplitude is set to 1
- **THEN** the drawn shape uses an amplitude of 1 and has cusps, while the
  letters are reshaped as though the amplitude were 1.15

#### Scenario: At and above the floor

- **WHEN** the amplitude is 1.15 or more
- **THEN** both use the same value and the inconsistency does not arise

### Requirement: The mark is measured by what it draws

The mark's extent SHALL be taken from the points of every drawn copy, not from
the curve's bounding circle and not from the viewBox it is drawn into.

A lobed shape does not fill its own bounding circle, and three lobes are not
symmetric about the centre, so a mark placed by anything other than its real
outline sits visibly off.

#### Scenario: Measuring the mark

- **WHEN** the mark's extent is needed
- **THEN** it is the extent of the sampled points of all copies

#### Scenario: A lopsided shape

- **WHEN** the copies are rotated so the stack is not symmetric
- **THEN** the measured extent reflects that, and the placement follows it
