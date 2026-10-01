## Purpose

The one boundary the whole architecture rests on. The core produces a scene
graph; renderers and exporters only read it. Nothing downstream of it reaches
back, and nothing in it knows what will draw it.

## ADDED Requirements

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
