## ADDED Requirements

### Requirement: A boolean engine is a registered module

Boolean operations SHALL be reached through an engine interface carrying a
union, a difference and an even-odd combine over rings. Engines SHALL be
registered the way every other extension point is, so one can be replaced
without touching its callers.

#### Scenario: The built-in engine is registered

- **WHEN** the engine registry is read
- **THEN** the polygon-clipping engine is in it under its own id

#### Scenario: An engine is replaced

- **WHEN** a second engine is registered and asked for by id
- **THEN** the same cleaning code runs against it with no change

### Requirement: A cleaned pass encloses what the preview fills

The preview fills each pass with the even-odd rule, so the exported shape SHALL
be the even-odd interior of that pass's contours. The result SHALL be polygons,
each an outer ring followed by its holes, so a counter is a hole in a shape
rather than a fill rule a later tool has to agree with.

#### Scenario: A counter becomes a hole

- **WHEN** a glyph whose outline encloses a counter is cleaned
- **THEN** the result is one polygon with one outer ring and one hole
- **AND** the hole lies inside the outer ring

#### Scenario: What the preview fills is what is exported

- **WHEN** a point is inside the even-odd interior of a pass
- **THEN** that point is inside the cleaned polygons
- **AND** a point outside it is outside them

#### Scenario: Separate contours stay separate

- **WHEN** two contours that do not touch are cleaned
- **THEN** the result is two polygons

#### Scenario: The result is well formed

- **WHEN** any pass of any glyph is cleaned
- **THEN** every ring closes, holds at least three distinct points, and contains
  no `NaN` and no infinity

### Requirement: Cleaning is robust against degenerate input

A contour with fewer than three points, with repeated points, or enclosing no
area SHALL NOT fail the operation. It SHALL be dropped and the rest SHALL be
cleaned.

#### Scenario: A degenerate contour

- **WHEN** a pass holds a contour of two points alongside a real one
- **THEN** the result holds the real one and nothing throws

#### Scenario: Nothing to clean

- **WHEN** a pass holds no usable contour
- **THEN** the result is no polygons and nothing throws

### Requirement: The engine snaps its input and refuses rather than guessing

Coordinates SHALL be snapped to a grid before the underlying library sees them,
because the stroker's output defeats its sweep line at full precision. When the
library still fails, the engine SHALL retry at coarser steps, and when every
step fails it SHALL throw an error naming the engine and the reason rather than
returning a shape that is wrong.

The finest step SHALL be far below the curve fitter's tolerance, so no snapping
is visible in the output.

#### Scenario: A real wordmark at random settings

- **WHEN** a wordmark is cleaned over random amplitudes, rotations and copy
  counts
- **THEN** the engine returns well formed polygons and does not throw

#### Scenario: Snapping is below what anything downstream can see

- **WHEN** the snapping steps are read
- **THEN** the finest is smaller than the default fit tolerance by a factor of a
  thousand or more

#### Scenario: An engine that cannot combine says so

- **WHEN** the underlying library fails at every step
- **THEN** an error naming the engine and the reason is thrown
