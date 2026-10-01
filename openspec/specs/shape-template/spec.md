# shape-template Specification

## Purpose
The base curve a designer picks drives the mark, the pen that strokes every
letter, the shape of the terminals and the loop in the joins. This capability
defines what a base curve is, how copies of it nest inside one another, and what
happens when its parameters reach a limit beyond which the geometry degenerates.

## Requirements

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

### Requirement: Five templates ship built in

The built-in template set SHALL contain `trefoil`, `rose`, `superellipse`,
`supershape` and `rounded-polygon`. Each SHALL declare its own parameter
definitions and its own safety metadata, rather than sharing another template's.

#### Scenario: The set is listed

- **WHEN** the built-in shape templates are registered
- **THEN** all five are present, each with at least one parameter and its own
  safety limits

#### Scenario: Every template samples cleanly

- **WHEN** each template is sampled at its default parameters
- **THEN** every point is finite and no radius exceeds 1 after normalisation

### Requirement: The rose generalises the trefoil

The rose SHALL compute `r = A + cos(k theta)` with `k` from 2 to 12. At `k` of 3
it SHALL produce the same curve as the trefoil for the same amplitude.

The trefoil SHALL remain a separate registration, because a project file stores
a template id and that id must keep meaning what it meant.

#### Scenario: The rose at three lobes

- **WHEN** the rose is evaluated with `k` of 3 and the trefoil with the same
  amplitude
- **THEN** their radii agree at every angle

#### Scenario: The rose at other lobe counts

- **WHEN** the rose is evaluated with `k` of 5
- **THEN** its curve repeats five times in a full turn

### Requirement: A template's declared symmetry matches its curve

A template that declares a symmetry SHALL produce a curve that maps onto itself
when rotated by a full turn divided by that symmetry.

Symmetry MAY be a fixed number or a function of the template's parameters, for
templates whose symmetry is itself a parameter such as the rose's lobe count or
the polygon's side count. A template SHALL NOT declare both forms.

#### Scenario: A declared symmetry holds

- **WHEN** a template declaring symmetry `s` is evaluated at any angle and at
  that angle plus a full turn over `s`
- **THEN** the two radii agree to within tolerance

#### Scenario: A template declares no symmetry

- **WHEN** a template declares no symmetry
- **THEN** no symmetry is asserted of it

#### Scenario: Symmetry depends on a parameter

- **WHEN** the rose's lobe count is changed
- **THEN** its reported symmetry changes with it

#### Scenario: A template declares both forms

- **WHEN** a template declares both a fixed symmetry and a symmetry function
- **THEN** the registration is rejected, naming the template

### Requirement: Templates without a closed-form maximum radius are sampled

A template MAY declare `maxRadius` in closed form. A template that does not
SHALL have its maximum radius found by sampling, and normalisation SHALL work
either way.

#### Scenario: A template declares its maximum radius

- **WHEN** the rose, which knows its maximum is `A + 1`, is normalised
- **THEN** the declared value is used

#### Scenario: A template does not declare one

- **WHEN** the supershape, which has no simple closed form, is normalised
- **THEN** its maximum is found by sampling and the result still fills the unit
  disc

### Requirement: Each template declares safety limits suited to its own shape

Safety metadata SHALL be declared per template. A template whose parameters can
drive it towards a degenerate curve SHALL declare the limit that prevents it.

#### Scenario: The superellipse at a low exponent

- **WHEN** the superellipse's exponent is driven towards its declared minimum
- **THEN** the computation applies the limit and reports a warning naming it

#### Scenario: A template within its limits

- **WHEN** any template is evaluated at its default parameters
- **THEN** no safety warning is produced

### Requirement: A curve is validated before it is nested

A curve SHALL be validated before nesting. Validation SHALL report whether the
curve closes, whether its radius stays non-negative, and whether it is
star-shaped about its centre.

A curve is star-shaped about its centre when every ray from the origin crosses
it exactly once, which for a sampled polar curve means the radius is defined and
non-negative at every angle.

Validation SHALL report what it found, not merely pass or fail, so the studio
can tell a designer which route was taken and why.

#### Scenario: A star-shaped curve

- **WHEN** the trefoil at its defaults is validated
- **THEN** it is reported as closed, non-negative and star-shaped

#### Scenario: A curve with a negative radius

- **WHEN** a curve whose radius goes below zero at some angle is validated
- **THEN** it is reported as not non-negative, naming an angle where it fails

#### Scenario: A curve that is not star-shaped

- **WHEN** a parametric curve that doubles back on itself is validated
- **THEN** it is reported as not star-shaped

#### Scenario: A curve that does not close

- **WHEN** a curve whose first and last sampled points are far apart is
  validated
- **THEN** it is reported as not closed

### Requirement: Nesting takes the route the curve allows

Nesting SHALL use the polar route when the curve validates as star-shaped, and
the parametric route otherwise. The route taken SHALL be reported with the
result.

The polar route SHALL produce exactly the values it produced before this
capability existed, for every curve that still qualifies for it.

#### Scenario: A star-shaped curve takes the polar route

- **WHEN** the trefoil is nested
- **THEN** the result reports the polar route
- **AND** its `perfectFit` equals what the polar computation alone returns

#### Scenario: A curve that is not star-shaped takes the parametric route

- **WHEN** a curve that fails the star-shaped test is nested
- **THEN** the result reports the parametric route
- **AND** a reason naming what disqualified the polar route

#### Scenario: A designer is told why

- **WHEN** the parametric route is taken
- **THEN** the reason is readable alongside the safety warnings, not thrown away

### Requirement: Parametric nesting finds the largest scale that still fits

The parametric route SHALL find the largest scale at which every point of the
copy, rotated by the step angle and scaled, lies inside the parent outline. It
SHALL do so by binary search with a point-in-polygon test.

The result SHALL be at most 1, and SHALL be at least zero.

#### Scenario: A copy at the found scale fits

- **WHEN** the parametric route returns a scale
- **THEN** every point of the copy at that scale lies inside or on the parent

#### Scenario: A copy slightly larger does not fit

- **WHEN** the copy is scaled slightly above the returned value
- **THEN** at least one of its points lies outside the parent

#### Scenario: A rotation of zero needs no shrinking

- **WHEN** the parametric route is given a rotation of zero
- **THEN** it returns 1, because the copy is the parent

#### Scenario: A curve with no area

- **WHEN** the parametric route is given a curve whose points enclose no area
- **THEN** it returns 1, matching the polar route's answer when nothing is
  finite, rather than 0, which would claim nothing fits

#### Scenario: The search converges

- **WHEN** the parametric route runs for any curve and rotation
- **THEN** it terminates and returns a finite value between 0 and 1

### Requirement: Point containment is decided by a tested predicate

Deciding whether a point lies inside a polygon SHALL use a predicate with its
own tests, including points on an edge, on a vertex, and outside a concave
region.

#### Scenario: A point inside a convex polygon

- **WHEN** a point at the centre of a square is tested
- **THEN** it is inside

#### Scenario: A point outside a convex polygon

- **WHEN** a point beyond a square's corner is tested
- **THEN** it is outside

#### Scenario: A point in a concave notch

- **WHEN** a point inside the notch of a concave polygon, but outside its filled
  area, is tested
- **THEN** it is outside

#### Scenario: A point on an edge

- **WHEN** a point lying exactly on an edge is tested
- **THEN** the answer is stable rather than depending on floating point noise

### Requirement: Both routes are memoised

The memo SHALL cover the parametric route as well as the polar one, keyed the
same way, because the parametric route is the more expensive of the two.

#### Scenario: A parametric result is asked for twice

- **WHEN** the parametric route is used twice for the same template, parameters
  and rotation
- **THEN** the second answer comes from the memo and the curve is not resampled
