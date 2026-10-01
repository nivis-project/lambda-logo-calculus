# glyph-set Specification

## Purpose
A letter in this studio is not an outline. It is a skeleton of strokes, bowls
and dots on a shared grid, which later stages reshape and a pen then strokes.
This capability defines that skeleton, the grid it lives on, and what a glyph
set must provide.

## Requirements

### Requirement: The grid is shared data

Every glyph SHALL be expressed in font units against one set of grid metrics:
stroke width, x-height, cap-height, descender, side bearing, dot radius, word
space and line height. The metrics SHALL match the prototype: 10, 56, 86, -28,
9, 7, 28 and 150.

A glyph SHALL carry its own advance width.

#### Scenario: The metrics are read

- **WHEN** the grid metrics are read
- **THEN** the x-height is 56, the cap-height is 86 and the descender is -28

#### Scenario: Every glyph declares an advance width

- **WHEN** the built-in glyph set is listed
- **THEN** every glyph has an advance width above zero

### Requirement: A skeleton is declarative and has no hidden inputs

A skeleton SHALL consist of primitives: a `stroke`, a `bowl` or a `dot`.

A `stroke` SHALL be an ordered list of segments, each either a `point` with
coordinates or an `arc` declared by its centre, its two radii and a start and
end angle in degrees. An arc SHALL NOT be stored as sampled points, because
sampling it is a later stage's work.

A stroke SHALL yield at least two nodes. A point is one node and an arc is at
least two, so a stroke of a single arc is valid and a stroke of a single point
is not.

A `bowl` SHALL carry a centre, two radii, and zero or more cut regions, each a
rectangle that removes part of the bowl to open a counter.

A `dot` SHALL carry a centre and a radius.

A skeleton SHALL depend on nothing outside itself: no amplitude, no rotation,
no stage toggle.

#### Scenario: A skeleton is read twice under different conditions

- **WHEN** the same glyph is read twice
- **THEN** both reads return identical data, whatever else has changed

#### Scenario: An arc is stored declaratively

- **WHEN** a glyph containing an arc is read
- **THEN** the arc reports its centre, radii and angles
- **AND** it carries no point list

#### Scenario: A bowl carries its cut regions

- **WHEN** the glyph `c` is read
- **THEN** it contains a bowl with exactly one cut region

### Requirement: The built-in set covers the prototype's alphabet

The built-in glyph set SHALL provide `a` to `z`, `A` to `Z`, `0` to `9`, the
punctuation marks `.`, `,`, `!`, `?`, `-` and `'`, and a notdef glyph.

Every glyph's coordinates SHALL match the prototype's, so the parity epic can
attribute any difference to a later stage rather than to the port.

#### Scenario: The set is complete

- **WHEN** the built-in glyph set is listed
- **THEN** it contains all 26 lower-case letters, all 26 upper-case letters, all
  10 digits, the six punctuation marks and the notdef

#### Scenario: A glyph matches the prototype

- **WHEN** the glyph `o` is read
- **THEN** it is a single bowl centred at 24, 28 with radii 24 and 28, and its
  advance width is 48

#### Scenario: A glyph with a descender

- **WHEN** the glyph `p` is read
- **THEN** its stroke runs from the x-height down to the descender at -28

### Requirement: An unknown character falls back rather than failing

Asking a glyph set for a character it does not have SHALL return the notdef
glyph. It SHALL NOT throw, and it SHALL NOT return nothing, because a designer
typing an unexpected character should see a box rather than a broken render.

#### Scenario: A character outside the set is requested

- **WHEN** a character the set does not define is requested
- **THEN** the notdef glyph is returned

#### Scenario: A defined character is requested

- **WHEN** the character `a` is requested
- **THEN** the glyph for `a` is returned, not the notdef

### Requirement: Glyph sets are registered and validated

A glyph set SHALL be a registered module carrying an id, a version, a label and
its parameter definitions, so alternates, accented glyphs and ligatures can be
added later as registrations.

Every glyph in a registered set SHALL validate against the skeleton schema.
A malformed glyph SHALL be rejected at registration, naming the character and
what is wrong.

#### Scenario: A set with a malformed glyph is registered

- **WHEN** a glyph set containing a bowl with a negative radius is registered
- **THEN** the registration is rejected, naming the character and the fault

#### Scenario: A set with a stroke of one point is registered

- **WHEN** a glyph set containing a stroke whose only segment is a point is
  registered
- **THEN** the registration is rejected, naming the character and saying a
  stroke needs at least two nodes

#### Scenario: A stroke that is a single arc

- **WHEN** a glyph containing a stroke whose only segment is an arc is validated
- **THEN** it passes, because an arc is at least two nodes

#### Scenario: The built-in set validates

- **WHEN** every glyph in the built-in set is validated
- **THEN** all of them pass
