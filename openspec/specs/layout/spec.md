# layout Specification

## Purpose
Where each glyph goes, where lines break, and where the mark sits relative to
the wordmark. Layout returns positions; it never draws.

## Requirements

### Requirement: Advance widths and spaces

The advance of a glyph SHALL be its declared width scaled by the width factor,
plus a side bearing on each side. A space SHALL advance by the word space
instead. The width of a string SHALL be the sum of its advances.

#### Scenario: A space advances by the word space

- **WHEN** the advance of a space is computed
- **THEN** it is the grid's word space

#### Scenario: A glyph advance includes both side bearings

- **WHEN** the advance of a glyph of declared width w is computed with a width
  factor of 1
- **THEN** it is `w + 2 * sideBearing`

#### Scenario: An empty string has no width

- **WHEN** the width of an empty string is computed
- **THEN** it is zero

### Requirement: Lines wrap at a given width

Wrapping SHALL break a text into lines no wider than a given maximum, breaking
at spaces where it can. A single word wider than the maximum SHALL be broken
mid-word, and the layout SHALL report that it had to.

#### Scenario: Text fits on one line

- **WHEN** a text narrower than the maximum is wrapped
- **THEN** one line is returned, unchanged

#### Scenario: Text wraps at a space

- **WHEN** a text of two words too wide together is wrapped
- **THEN** two lines are returned, split at the space
- **AND** the layout does not report a mid-word break

#### Scenario: A word is wider than the maximum

- **WHEN** a single word wider than the maximum is wrapped
- **THEN** it is broken across lines
- **AND** the layout reports that it broke mid-word

#### Scenario: Every line respects the maximum

- **WHEN** any text is wrapped at any positive maximum
- **THEN** no returned line is wider than the maximum, unless it is a single
  character that cannot be broken further

### Requirement: A lockup places the mark by its real outline

A lockup SHALL take the mark's outline bounds and the text block and return
positions. The mark SHALL be sized against the height of the text block, not a
fixed value, and SHALL be enlarged optically by 6%.

The side lockup SHALL reserve space to the left of the text. When a side lockup
would force a word to break mid-word, the layout SHALL switch to placing the
mark above the text instead.

#### Scenario: A mark is sized against one line

- **WHEN** the side lockup places a mark against a single-line text block
- **THEN** the mark's height is the cap-height times 1.06, scaled to fit, times
  the mark size setting

#### Scenario: A mark is sized against two lines

- **WHEN** the text block is two lines
- **THEN** the mark is taller than it was for one line

#### Scenario: Space runs out

- **WHEN** the available width is too narrow for a side lockup without breaking
  a word
- **THEN** the lockup switches to placing the mark above the text
- **AND** no space is reserved to the side

#### Scenario: The mark is switched off

- **WHEN** the mark is disabled
- **THEN** no space is reserved and the text uses the full width

### Requirement: Layout returns positions, never geometry

Layout SHALL return positions and sizes. It SHALL NOT produce outlines, colours
or scene nodes.

#### Scenario: A layout result is inspected

- **WHEN** a layout result is inspected
- **THEN** it contains positions, sizes and line contents, and no path data
