## ADDED Requirements

### Requirement: The alphabet is extracted, not transcribed

The glyph data SHALL be produced by evaluating the prototype's own glyph table
with helpers that record structure, rather than by copying coordinates by hand.

A test SHALL re-run the extraction against the frozen prototype and compare it
against the committed alphabet, so the two cannot drift apart.

#### Scenario: The alphabet matches its source

- **WHEN** the extraction is re-run
- **THEN** it produces exactly the committed alphabet

#### Scenario: A hand edit to the alphabet

- **WHEN** a coordinate in the committed alphabet is changed by hand
- **THEN** the comparison fails, naming the glyph

#### Scenario: Arcs survive extraction

- **WHEN** a glyph holding an arc is extracted
- **THEN** the arc is recorded as a centre, two radii and two angles, not as
  sampled points

### Requirement: A glyph set is validated when it is registered

Registering a glyph set SHALL check every glyph, and SHALL refuse the set when
one is malformed, naming the character and what is wrong.

A set SHALL be refused when it defines no notdef glyph, because a set that
cannot answer for an unknown character is a set that fails at render time
instead.

A glyph SHALL be refused when its advance is not a positive finite number, when
a part is of no known kind, when a coordinate is not finite, when a stroke holds
no segments or a single point, or when an arc has a radius that is not positive.

A stroke of a single arc is valid: an arc samples into many points, so one of
them draws a line where one point does not.

#### Scenario: A set with no notdef

- **WHEN** a glyph set without a notdef glyph is registered
- **THEN** it is refused

#### Scenario: A malformed glyph

- **WHEN** a glyph has a negative advance, a non-finite coordinate or a stroke
  of one point
- **THEN** the set is refused and the message names the character

#### Scenario: A stroke that is one arc

- **WHEN** a glyph holds a stroke of a single arc segment
- **THEN** it is accepted, because an arc samples into many points

#### Scenario: An unknown character at render time

- **WHEN** a character with no glyph is drawn from a valid set
- **THEN** the notdef glyph is drawn and nothing fails
