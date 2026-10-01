## Purpose

A generated alphabet is only usable if one letter can be fixed without breaking
the generation. This capability is the small, surviving patch that does it.

## ADDED Requirements

### Requirement: A patch adjusts what the pipeline produced

A per-glyph patch SHALL be keyed by character and SHALL carry only adjustments:
an offset, a scale, an advance width override, and an ending override.

A patch SHALL NOT replace a glyph's skeleton. It is applied after the stage list
and before the stroker, so the glyph still responds to every parameter.

#### Scenario: A patch is applied

- **WHEN** a glyph with an offset patch is rendered
- **THEN** its geometry is moved by that offset
- **AND** the rest of the wordmark is unchanged

#### Scenario: A patch survives a parameter change

- **WHEN** a glyph is patched and then a template parameter is changed
- **THEN** the patch still applies, on top of the new geometry

#### Scenario: A patch carries only adjustments

- **WHEN** a patch is inspected
- **THEN** it holds an offset, a scale, an advance and an ending, and no
  skeleton

### Requirement: The four adjustments do what they say

An offset SHALL move the glyph's geometry. A scale SHALL scale it about its own
centre. An advance override SHALL replace the glyph's advance width. An ending
override SHALL use a different ending for that glyph only.

#### Scenario: An offset moves one glyph

- **WHEN** one character is offset
- **THEN** only that character's geometry moves

#### Scenario: A scale scales about the glyph's own centre

- **WHEN** a glyph is scaled
- **THEN** its centre stays where it was

#### Scenario: An advance override changes the spacing after it

- **WHEN** a glyph's advance is overridden
- **THEN** every glyph after it moves by the difference

#### Scenario: An ending override applies to one glyph

- **WHEN** one character's ending is overridden
- **THEN** that character is stroked with the overriding ending and the others
  are not

#### Scenario: An empty patch changes nothing

- **WHEN** a patch carries no adjustment
- **THEN** the rendered result is identical to having no patch at all

### Requirement: A spacing pair adds space between two characters

A spacing pair SHALL name two characters and an extra advance, applied when the
first is immediately followed by the second.

#### Scenario: A pair applies

- **WHEN** a pair for `A` then `v` is set and the text contains `Av`
- **THEN** the space between them changes by the pair's amount

#### Scenario: A pair does not apply elsewhere

- **WHEN** the same pair is set and the text contains `vA`
- **THEN** the space between them is unchanged

#### Scenario: A pair changes the wrap

- **WHEN** a pair widens a word past the available width
- **THEN** the wrapping reflects the new width

### Requirement: Overrides are project state

Patches and pairs SHALL live in the project, so they serialise with it, they
undo, and they are restored with a variant.

#### Scenario: Overrides round-trip

- **WHEN** a project with patches and pairs is serialised and parsed back
- **THEN** both are present and unchanged

#### Scenario: An override undoes

- **WHEN** a patch is set and then undone
- **THEN** the glyph returns to its unpatched geometry

### Requirement: A glyph can be identified on the canvas

Each glyph's group in the scene SHALL carry the character it draws and its index
in the text, so a renderer can say which glyph was clicked.

#### Scenario: A glyph group is identified

- **WHEN** a scene is built
- **THEN** each glyph group reports its character and its index

#### Scenario: Two of the same character

- **WHEN** a text contains the same character twice
- **THEN** the two groups report the same character and different indices
