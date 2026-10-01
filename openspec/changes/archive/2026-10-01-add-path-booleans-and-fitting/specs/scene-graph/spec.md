## ADDED Requirements

### Requirement: A path node may carry a fitted curve form

A path node SHALL be able to carry a list of fitted curve contours alongside its
polyline contours. The polylines SHALL remain, so measuring and hit-testing are
unchanged, and a renderer SHALL draw the curves when they are present and the
polylines when they are not.

A curve contour SHALL be a list of commands: one move, then lines and cubics,
then a close.

#### Scenario: A scene without curves

- **WHEN** a path node carries only polylines
- **THEN** a renderer draws the polylines and the output is unchanged

#### Scenario: A scene with curves

- **WHEN** a path node carries fitted curves
- **THEN** a renderer draws those, and the path data holds cubic commands

#### Scenario: Measuring ignores the curves

- **WHEN** a scene carrying fitted curves is measured
- **THEN** the bounds come from the polylines, and are the same as before fitting

### Requirement: A scene is cleaned for export

Cleaning a scene SHALL combine each path node's contours through the boolean
engine, fit the result at the given tolerance, and set the fill rule to
non-zero, leaving every other part of the scene as it was.

#### Scenario: A cleaned scene

- **WHEN** a scene is cleaned
- **THEN** each path node carries fitted curves and a non-zero fill rule
- **AND** the transforms, the colours and the opacities are unchanged

#### Scenario: The live scene is untouched

- **WHEN** a scene is cleaned
- **THEN** the scene that was given is unchanged, and still fills with even-odd
