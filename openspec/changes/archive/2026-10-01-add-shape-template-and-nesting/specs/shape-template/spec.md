## Purpose

The base curve a designer picks drives the mark, the pen that strokes every
letter, the shape of the terminals and the loop in the joins. This capability
defines what a base curve is, how copies of it nest inside one another, and what
happens when its parameters reach a limit beyond which the geometry degenerates.

## ADDED Requirements

### Requirement: A base curve is a registered template

A base curve SHALL be a module registered into the template registry, carrying
an id, a version, a label and its parameter definitions. It SHALL declare a
`kind` of either `polar` or `parametric`.

A `polar` template SHALL provide `radius(theta, params)` returning the radius at
an angle in radians. A `parametric` template SHALL provide `point(t, params)`
returning a point for `t` in `[0, 1)`. A template MAY declare a `symmetry`: the
number of times its shape repeats in a full turn.

#### Scenario: The trefoil is registered

- **WHEN** the built-in templates are registered
- **THEN** a template with id `trefoil` is present
- **AND** its kind is `polar`, its symmetry is 3, and it declares a parameter
  `A` ranging from 1 to 20 with default 3

#### Scenario: A polar template without a radius function

- **WHEN** a template declares kind `polar` but provides no `radius`
- **THEN** the registration is rejected, naming the template

#### Scenario: A parametric template without a point function

- **WHEN** a template declares kind `parametric` but provides no `point`
- **THEN** the registration is rejected, naming the template

### Requirement: The trefoil reproduces the prototype's curve

The trefoil template SHALL compute `r(theta) = A + cos(3 theta)`.

#### Scenario: The radius at known angles

- **WHEN** the trefoil radius is evaluated with `A` of 3
- **THEN** it is 4 at theta 0
- **AND** it is 2 at theta pi/3
- **AND** it is 4 at theta 2pi/3

#### Scenario: The curve repeats with its declared symmetry

- **WHEN** the trefoil radius is evaluated at any theta and at theta plus
  2pi/3
- **THEN** both values are equal to within floating point tolerance

### Requirement: A curve is sampled into normalised points

Sampling SHALL return a requested number of points evenly spaced in the
template's parameter, each scaled so the curve's maximum radius is 1. The
samples SHALL carry the angle they were taken at, so later stages can ask the
curve about a direction.

#### Scenario: A curve is sampled

- **WHEN** the trefoil is sampled 144 times with `A` of 3
- **THEN** 144 points are returned
- **AND** no point lies further from the origin than 1
- **AND** at least one point lies at a distance of 1 to within tolerance

#### Scenario: Sampling is deterministic

- **WHEN** the same template and parameters are sampled twice
- **THEN** both results are identical

### Requirement: Copies nest by the largest scale that still fits

For a polar template, `perfectFit` SHALL be the minimum over theta of
`r(theta) / r(theta - phi)`, where `phi` is the rotation between successive
copies. Angles where the denominator is at or below zero SHALL be skipped. The
result SHALL never be below zero, and SHALL be 1 when no angle yields a finite
ratio.

The effective scale SHALL be `perfectFit` raised to the power `1 - 5 f`, where
`f` is the fit size. The scale of copy `i` SHALL be the effective scale raised
to `i`.

#### Scenario: No rotation means no shrinking

- **WHEN** `perfectFit` is computed for the trefoil at a rotation of 0
- **THEN** the result is 1 to within tolerance

#### Scenario: A full symmetry step means no shrinking

- **WHEN** `perfectFit` is computed for the trefoil at a rotation of 120 degrees
- **THEN** the result is 1 to within tolerance, because the curve maps onto
  itself

#### Scenario: A rotation between the symmetry steps shrinks the copy

- **WHEN** `perfectFit` is computed for the trefoil at a rotation of 24 degrees
  with `A` of 3
- **THEN** the result is above 0 and below 1

#### Scenario: Fit size zero leaves the effective scale equal to perfectFit

- **WHEN** the effective scale is computed with a fit size of 0
- **THEN** it equals `perfectFit`

#### Scenario: The first copy is never scaled

- **WHEN** the scale of copy 0 is computed, for any parameters
- **THEN** it is 1

#### Scenario: A nested copy stays inside its parent

- **WHEN** copy `i + 1` of the trefoil is compared against copy `i` at any angle
- **THEN** the inner copy's radius does not exceed its parent's, for parameters
  where no safety limit was reached

### Requirement: Safety limits are declared, applied and reported

Each template SHALL declare its own safety limits rather than relying on numbers
written into the computation. The trefoil SHALL declare a minimum `A` of 1.15, a
minimum `perfectFit` of 0.02, a maximum effective scale of 1.5 and a maximum
copy scale of 1.6, matching the prototype.

When a limit is applied, the computation SHALL return a warning naming the limit
and both the value given and the value used. A limit SHALL never be applied
silently.

#### Scenario: A low amplitude reaches the minimum

- **WHEN** the nesting is computed with `A` of 0.5 against a declared minimum of
  1.15
- **THEN** the computation uses 1.15
- **AND** a warning names the limit, the value 0.5 and the value 1.15

#### Scenario: A copy scale reaches its maximum

- **WHEN** parameters drive a copy scale above the declared maximum of 1.6
- **THEN** the scale used is 1.6
- **AND** a warning names the limit and both values

#### Scenario: Parameters within every limit produce no warning

- **WHEN** the nesting is computed with `A` of 3, 6 copies and a rotation of 24
  degrees
- **THEN** no warning is returned

### Requirement: Nesting results are memoised

Computing `perfectFit` SHALL be memoised by template id, template version,
parameter values and rotation, because it samples the curve hundreds of times
and the studio recomputes it on every parameter change.

A memoised result SHALL be identical to a freshly computed one.

#### Scenario: The same question is asked twice

- **WHEN** `perfectFit` is computed twice for the same template, parameters and
  rotation
- **THEN** both results are identical
- **AND** the underlying curve was sampled only for the first

#### Scenario: A parameter changes

- **WHEN** `perfectFit` is computed for one amplitude and then for another
- **THEN** the second result reflects the new amplitude, not the cached one
