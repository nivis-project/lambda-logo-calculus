# curve-fitting Specification

## Purpose
TBD - created by archiving change add-path-booleans-and-fitting. Update Purpose after archive.

## Requirements

### Requirement: A polyline is fitted to cubic Beziers inside a tolerance

Fitting SHALL turn a ring of points into a closed path of cubic Bezier segments.
Every point of the input SHALL lie within the tolerance of the fitted path. A
segment that cannot be fitted within the tolerance SHALL be split and both
halves fitted, rather than accepted.

#### Scenario: The fit stays inside the tolerance

- **WHEN** a ring is fitted at a given tolerance
- **THEN** every input point is within that tolerance of the fitted path

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

### Requirement: The tolerance is stated and justified

The default tolerance SHALL be a named constant carrying the reasoning for its
value, in font units, and SHALL be overridable per export.

It SHALL be chosen so the fitted path data is smaller than the polyline path
data it replaces. A tolerance tighter than the stroker's own faceting makes the
file larger rather than smaller, because a cubic command costs about three times
a line command and cannot span a corner.

#### Scenario: The default is named

- **WHEN** the fitter is used without a tolerance
- **THEN** the default constant is used

#### Scenario: An export chooses its own

- **WHEN** a tolerance is given
- **THEN** that value is used instead

### Requirement: A short ring is kept as lines

A ring too short to carry a curve SHALL be emitted as line segments rather than
fitted, because a fitted curve through three points invents a shape that was
never there.

#### Scenario: A triangle

- **WHEN** a ring of three points is fitted
- **THEN** the result is three lines and a close, with no curve
