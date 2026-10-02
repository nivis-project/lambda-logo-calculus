# scene-graph Specification

## Purpose
What a renderer reads: plain, serialisable nodes that nothing writes back to, so
a screen, a file and a test can all be driven from the same description.

## Requirements

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

### Requirement: A path holds only the contours that must interact

A path node SHALL hold the contours that are meant to cut each other through
the fill rule, and no others.

A ring's outside and inside SHALL share a path, because that is what makes its
counter. An outline, an ending and a stamp SHALL each have their own, because
where they overlap they are meant to be solid.

Merging them is how a stamp covering a joint becomes a hole in the letter.

#### Scenario: A ring

- **WHEN** a bowl is drawn
- **THEN** its two sides share one path and the counter is open

#### Scenario: A stamp over a joint

- **WHEN** a stamp is drawn where two runs meet
- **THEN** it is solid, and does not cut a hole in what is under it

#### Scenario: An ending over its stroke

- **WHEN** a round ending overlaps the stroke it caps
- **THEN** the overlap is solid

### Requirement: A group can carry an opacity

A group node SHALL be able to carry an opacity. Its children SHALL be drawn
and flattened together, and the opacity applied to the result.

A group SHALL also be able to carry a fill, which its children inherit unless
they set their own.

Opacity on a group and opacity on each of its children are different drawings.
On the children, overlaps between them blend twice and show as seams and dark
patches. On the group, they do not.

#### Scenario: Two overlapping shapes in a group

- **WHEN** two semi-transparent shapes overlap inside a group whose opacity is
  set
- **THEN** their overlap is the same shade as each of them alone

#### Scenario: Two overlapping shapes with their own opacity

- **WHEN** the same two shapes each carry the opacity instead
- **THEN** their overlap is darker, which is why a pass sets it on its group

#### Scenario: A pass

- **WHEN** a pass of a glyph is built
- **THEN** its opacity is on the group, and its paths carry none
