# scene-graph Specification

## Purpose
The one boundary the whole architecture rests on. The core produces a scene
graph; renderers and exporters only read it. Nothing downstream of it reaches
back, and nothing in it knows what will draw it.

## Requirements

### Requirement: The scene graph is plain serialisable data

A scene SHALL consist of nodes that are plain data: a `path` carrying contours
and a style, a `group` carrying child nodes and an optional transform. Every
node SHALL be JSON-serialisable, with no function, no DOM reference and no
renderer-specific field.

#### Scenario: A scene survives a round trip through JSON

- **WHEN** a scene is serialised to JSON and parsed back
- **THEN** the result equals the original

#### Scenario: A scene carries no renderer concept

- **WHEN** a scene produced by the core is inspected
- **THEN** no node carries an element reference, an id assigned by a renderer,
  or a mask

### Requirement: The scene carries the flip from font units to screen units

Glyph geometry is in font units, where y grows upward from the baseline. Screen
and SVG coordinates grow downward. The scene SHALL carry that flip as an
ordinary transform on a group, so a renderer needs no knowledge of font
conventions.

#### Scenario: A glyph above the baseline is placed in a scene

- **WHEN** a glyph whose geometry sits above the baseline in font units is
  placed in a scene
- **THEN** the scene's root group carries a transform that negates y
- **AND** the viewBox covers the flipped range

#### Scenario: A renderer applies the flip like any other transform

- **WHEN** a renderer draws the scene
- **THEN** it applies that transform exactly as it applies any other, with no
  special case

### Requirement: Cut regions are data, not masks

A counter SHALL be recorded as geometry, so an exporter can cut a real hole. The
scene graph SHALL NOT contain masks. A renderer MAY use a mask to display one,
but that is the renderer's choice and never appears in the scene.

#### Scenario: A glyph with a counter is placed in a scene

- **WHEN** a glyph with a counter becomes a scene node
- **THEN** the counter is present as a contour with its own winding, not as a
  mask reference

### Requirement: Ids are assigned by the renderer

The core SHALL NOT assign element ids. A renderer SHALL assign them from its own
counter, so two renderers mounted at once produce disjoint ids.

#### Scenario: Two renderers draw the same scene

- **WHEN** the same scene is drawn by two renderer instances
- **THEN** no id produced by one appears in the output of the other

#### Scenario: One renderer draws twice

- **WHEN** a renderer draws a scene and then draws it again
- **THEN** the second draw does not leave ids from the first behind

### Requirement: A renderer only reads the scene

A renderer SHALL take a scene and produce output. It SHALL NOT call into the
core, read parameters, or hold state derived from anything but the scene it was
given.

#### Scenario: A scene is rendered with no core available

- **WHEN** a scene constructed by hand, with no core involved, is drawn
- **THEN** it renders correctly

#### Scenario: Rendering is deterministic

- **WHEN** the same scene is drawn twice by the same renderer instance
- **THEN** the geometry of both outputs is identical

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

### Requirement: A scene can hold text

A scene SHALL be able to hold a text node carrying a position, a size, a fill
and a string. Text SHALL be anchored at its start, because a PDF cannot centre
text without font metrics and a sheet that differs between formats is worse than
one that only left-aligns.

Measuring a scene SHALL ignore text, because its extent depends on a font the
scene does not carry.

#### Scenario: Text in a rendered scene

- **WHEN** a scene holding text is rendered
- **THEN** the text appears at its position, in its size and its fill

#### Scenario: Text does not move the bounds

- **WHEN** a scene holding text is measured
- **THEN** the bounds are those of its paths alone

#### Scenario: Cleaning leaves text alone

- **WHEN** a scene holding text is cleaned for export
- **THEN** the text is unchanged

### Requirement: A scene can be composed into another

A scene SHALL be placeable inside another at a position and a scale, as a group
carrying that transform. Composing SHALL NOT change the scene being placed.

#### Scenario: Placing a scene

- **WHEN** a scene is placed at a position and a scale
- **THEN** its geometry appears there, scaled by that amount

#### Scenario: The placed scene is untouched

- **WHEN** a scene is placed
- **THEN** the scene that was given is unchanged
