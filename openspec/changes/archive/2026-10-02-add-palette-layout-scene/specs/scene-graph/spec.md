## Purpose

What a renderer reads: plain, serialisable nodes that nothing writes back to, so
a screen, a file and a test can all be driven from the same description.

## ADDED Requirements

### Requirement: A scene is plain data

A scene SHALL be a view box and a tree of nodes. A node SHALL be a group, with
an optional transform and children, or a path, with contours and a style.

A scene SHALL be serialisable. It SHALL hold no function, no reference back to
the pipeline, and no handle to anything that drew it.

#### Scenario: A scene round-trips

- **WHEN** a scene is serialised and parsed back
- **THEN** the result equals the original

#### Scenario: Nothing writes back

- **WHEN** a renderer draws a scene
- **THEN** the scene is unchanged

### Requirement: A scene holds no masks

A scene SHALL NOT hold a mask, a clip path or a filter. A counter SHALL be a
second contour in the same path, drawn with the even-odd rule.

The prototype cuts its bowls with SVG masks. A mask cannot be exported to PDF
without rasterising, and is unreliable in drawing tools, so the port does
without one.

#### Scenario: A counter

- **WHEN** a glyph with a counter is built into a scene
- **THEN** the counter is a contour in the same path, with the even-odd rule

#### Scenario: No masks anywhere

- **WHEN** any scene is inspected
- **THEN** it holds no mask, clip path or filter

### Requirement: A renderer reads only the scene

A renderer SHALL take a scene and produce its output from that alone. It SHALL
NOT reach back into the pipeline for anything.

Ids SHALL be assigned by the renderer, not carried in the scene, so the same
scene rendered twice gives the same output and two scenes rendered into one
document do not collide.

#### Scenario: The same scene twice

- **WHEN** a scene is rendered twice
- **THEN** the two outputs are identical

#### Scenario: A scene with no renderer-specific data

- **WHEN** a scene is built
- **THEN** it carries no id, no element name and nothing else only one renderer
  would want
