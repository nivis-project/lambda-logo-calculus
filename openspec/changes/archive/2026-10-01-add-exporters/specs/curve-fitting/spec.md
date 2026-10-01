## MODIFIED Requirements

### Requirement: A polyline is fitted to cubic Beziers inside a tolerance

Fitting SHALL turn a ring of points into a closed path of line and cubic Bezier
segments. Every point of the input SHALL lie within the tolerance of the fitted
path, and every point of the fitted path SHALL lie within the tolerance of the
input. A segment that cannot be fitted within the tolerance SHALL be split and
both halves fitted, rather than accepted.

A span of two points SHALL be written as a line, because a cubic through two
points invents a bulge the input never had, and because a line is a third of the
bytes.

#### Scenario: The fit stays inside the tolerance

- **WHEN** a ring is fitted at a given tolerance
- **THEN** every input point is within that tolerance of the fitted path

#### Scenario: The fit does not stray from the input

- **WHEN** a ring with a sharp spike in it is fitted
- **THEN** every point of the fitted path is within the tolerance of the ring

#### Scenario: The fit is shorter than the input

- **WHEN** a wordmark's rings are fitted at the default tolerance
- **THEN** the path holds fewer than half as many segments as the rings hold
  points, and its path data is smaller than the polylines' path data

#### Scenario: A tighter tolerance fits more closely

- **WHEN** the same ring is fitted at a tighter tolerance
- **THEN** the worst deviation is no larger, and the segment count is no smaller

#### Scenario: The path closes

- **WHEN** any ring is fitted
- **THEN** the path begins with a move, ends with a close, and its last point is
  its first

#### Scenario: The fit holds no NaN

- **WHEN** any ring is fitted
- **THEN** no coordinate of the result is `NaN` or infinite
