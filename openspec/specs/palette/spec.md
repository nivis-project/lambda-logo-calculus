# palette Specification

## Purpose
Colour is chosen per copy, from a scheme the designer picks. This capability
defines what a palette is and ports the six the prototype has.

## Requirements

### Requirement: A palette maps a copy index to a colour

A palette SHALL be a registered module with a pure
`colorAt(index, count, params)` returning a colour string. It SHALL be
deterministic and SHALL handle a count of one without dividing by zero.

#### Scenario: A single copy

- **WHEN** a palette is asked for the colour of copy 0 of 1
- **THEN** it returns a colour, with no division by zero

#### Scenario: Colours vary across copies

- **WHEN** a palette is asked for each of six copies
- **THEN** at least two of the six colours differ

#### Scenario: A palette is deterministic

- **WHEN** a palette is asked for the same index and count twice
- **THEN** both answers are identical

### Requirement: The six built-in schemes match the prototype

The palette registry SHALL contain `monochrome`, `analogous`, `complementary`,
`triadic`, `warm` and `cool`, each using the prototype's formula with a base hue
of 322.

Writing `f` for `index / (count - 1)` when the count is above one and 0
otherwise, the schemes SHALL be:

- monochrome: hue 322, saturation 62, lightness `30 + 38 f`
- analogous: hue `287 + 70 f`, saturation 70, lightness 50
- complementary: hue 322 or 142 by parity of the index, saturation 70,
  lightness `44 + 14 f`
- triadic: hue `322 + 120 (index mod 3)`, saturation 68, lightness 50
- warm: hue `345 + 65 f`, saturation 78, lightness 52
- cool: hue `170 + 100 f`, saturation 62, lightness 48

#### Scenario: All six are registered

- **WHEN** the palette registry is listed
- **THEN** it contains exactly the six named schemes

#### Scenario: Monochrome at both ends

- **WHEN** monochrome is asked for copy 0 and the last copy of six
- **THEN** both have hue 322 and saturation 62, and the last is lighter

#### Scenario: Complementary alternates

- **WHEN** complementary is asked for copies 0 and 1
- **THEN** their hues are 180 degrees apart

#### Scenario: Hues stay in range

- **WHEN** any palette is asked for any index and count
- **THEN** the hue it reports is at least 0 and below 360
