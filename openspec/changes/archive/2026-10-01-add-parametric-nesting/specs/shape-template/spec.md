## ADDED Requirements

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
