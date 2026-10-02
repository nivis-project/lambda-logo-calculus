# layout-and-lockup Specification

## Purpose
Putting the letters in a line, the lines on a page, the mark beside or above
them, and colour on all of it.

## Requirements

### Requirement: Advances and wrapping

A character's advance SHALL be its glyph's advance scaled by the letter width
factor, plus twice the side bearing. A space SHALL advance by the word space,
unscaled.

Text SHALL be wrapped to an available width by words. A word too wide for the
line on its own SHALL be broken between characters, and the fact that a word was
broken SHALL be reported, because the lockup depends on it.

#### Scenario: A line that fits

- **WHEN** a line of words fits the available width
- **THEN** it is one line

#### Scenario: A word too wide

- **WHEN** one word is wider than the available width
- **THEN** it is broken between characters and the break is reported

#### Scenario: The width factor reaches the advance

- **WHEN** the letter width factor changes
- **THEN** advances change with it, and the word space does not

### Requirement: The mark is placed against the text block

When the mark is shown and the text fits beside it, the mark SHALL be scaled so
its drawn height matches the text block: the cap height for one line, and the
cap height plus one line height for two lines or more.

That height SHALL be enlarged by 6 percent, because a lobed shape reads smaller
than a letter of the same height.

The mark SHALL also be limited to 30 percent of the available width.

The gap between the mark and the first letter SHALL be half the mark's drawn
height times `0.6 + 0.8 * distance`.

#### Scenario: One line

- **WHEN** the text is one line
- **THEN** the mark is as tall as the cap height, enlarged 6 percent

#### Scenario: Three lines

- **WHEN** the text is three lines
- **THEN** the mark is as tall as two lines, not three

#### Scenario: A narrow space

- **WHEN** 30 percent of the available width is less than the height would give
- **THEN** the width limit decides the size

### Requirement: The placement settles by iteration

The mark's size depends on how many lines there are, and how many lines there
are depends on how much width the mark reserves. The layout SHALL resolve this
by iterating, at most four times, stopping as soon as the line count stops
changing.

#### Scenario: The count settles

- **WHEN** the line count is the same as the previous iteration
- **THEN** the layout stops iterating

#### Scenario: The count does not settle

- **WHEN** four iterations pass without settling
- **THEN** the fourth result is used

### Requirement: The mark stacks above when the text would break

When showing the mark beside the text would force a word to break, the mark
SHALL be placed above the text instead, at cap height, limited to 60 percent of
the available width, and the reserved side width SHALL be released.

In that arrangement the distance control SHALL move the mark along the line and
the height control SHALL change the space below it.

#### Scenario: Too narrow for a side lockup

- **WHEN** placing the mark beside the text would break a word
- **THEN** the mark goes above the text

#### Scenario: The controls change meaning

- **WHEN** the mark is above the text
- **THEN** distance moves it horizontally and height changes the gap below it

### Requirement: The six palettes

Colour SHALL be chosen per copy, from the copy's index and the copy count, by
one of six palettes, all built on a base hue of 322 degrees. With `f` the
copy's position from 0 to 1 across the stack:

| palette       | hue                        | saturation | lightness   |
| ------------- | -------------------------- | ---------- | ----------- |
| Monochrome    | 322                        | 62         | 30 + f * 38 |
| Analogous     | 322 - 35 + f * 70          | 70         | 50          |
| Complementary | 322, or 322 + 180 when the index is odd | 70 | 44 + f * 14 |
| Triadic       | 322 + 120 * (index mod 3)  | 68         | 50          |
| Warm          | 345 + f * 65               | 78         | 52          |
| Cool          | 170 + f * 100              | 62         | 48          |

A hue SHALL be wrapped into 0 to 360.

#### Scenario: A single copy

- **WHEN** there is one copy
- **THEN** `f` is 0 and the first colour of the palette is used

#### Scenario: Complementary alternates

- **WHEN** the palette is Complementary
- **THEN** consecutive copies alternate between the base hue and its opposite

### Requirement: The rendered geometry depends on the container width

The prototype SHALL be recorded as deriving its layout from the width of the
element it draws into: a display scale of `min(1.3, max(0.62, width / 560))`,
and an available width of the container width divided by that scale, less twice
a padding of 14.

The number of lines, the mark's size, whether the mark stacks, and therefore
every coordinate, follow from that.

This is a defect for the project's purposes: it means the same parameters render
differently in two windows, and it means any recording of the prototype's output
is only meaningful alongside the width it was recorded at.

#### Scenario: Two widths

- **WHEN** the same text and parameters are rendered into two containers of
  different widths
- **THEN** the output differs

#### Scenario: Recording the prototype

- **WHEN** the prototype's output is recorded for comparison
- **THEN** the container width is fixed and recorded with it

### Requirement: The grid overlay

A grid overlay SHALL be available, drawing the baseline, the current x-height,
the cap height and the descender across the full width, with the baseline solid
and the others dashed, and a box around each character's advance.

#### Scenario: The overlay follows the x-height

- **WHEN** the fit size moves the x-height and the overlay is on
- **THEN** the x-height line moves with it

### Requirement: The ornament mode is a second drawing path

A second mode SHALL draw the reshaped skeleton with a plain round pen of the
stroke width, fill each bowl with the nested stack behind a mask, and stamp a
small stack at each free stroke end.

The prototype SHALL be recorded as implementing this as a separate code path
that duplicates the layout but not the stroker, and as using SVG masks, which
the exports in later milestones cannot use.

#### Scenario: Ornament mode draws the same skeleton

- **WHEN** the ornament mode is chosen
- **THEN** the skeleton is the same one the letter mode would reshape

#### Scenario: Masks

- **WHEN** a bowl is drawn in ornament mode
- **THEN** the prototype uses a mask to cut its counter

### Requirement: The port takes the available width as a parameter

Layout SHALL take the width it has to work in as an input. It SHALL NOT read it
from the element it is drawn into.

The prototype derives its layout from the width of its container, which
milestone 02 recorded as a defect: the same parameters render differently in two
windows, and no output is reproducible without also recording the width. The
port makes the width an input so that the same inputs always give the same
output.

#### Scenario: The same inputs twice

- **WHEN** a layout is computed twice from the same inputs, including the width
- **THEN** the two results are identical

#### Scenario: Two widths

- **WHEN** the same text is laid out at two widths
- **THEN** the results differ, and both are reproducible

#### Scenario: Nothing is measured

- **WHEN** a layout is computed
- **THEN** no element is measured and no document is consulted

### Requirement: The mark is drawn where the lockup puts it

A scene SHALL hold the mark when it is on, at the scale and position the lockup
computed, in whichever arrangement the lockup chose.

The text SHALL start after the width the lockup reserved, so the letters and the
mark do not overlap.

#### Scenario: Beside the words

- **WHEN** the lockup places the mark beside the text
- **THEN** the scene holds the mark to the left of the first letter, and the
  text begins after the reserved width

#### Scenario: Above the words

- **WHEN** the lockup stacks the mark above the text
- **THEN** the scene holds the mark above the first line, and no width is
  reserved beside it

#### Scenario: The mark is off

- **WHEN** the mark is switched off
- **THEN** the scene holds only the letters, and nothing is reserved

### Requirement: The mark is measured by what it draws

The mark's size and position SHALL be computed from the extent of the geometry
it actually draws, not from the view box it was drawn into and not from the
curve's bounding circle.

A lobed shape does not fill its own bounding circle, and a stack of rotated
copies is not symmetric about its centre, so a mark placed by anything else sits
visibly off.

#### Scenario: A lopsided stack

- **WHEN** the copies are rotated so the stack is not symmetric about its centre
- **THEN** the mark is still centred on the text block by its drawn extent

#### Scenario: Empty corners

- **WHEN** the mark has empty corners
- **THEN** they do not push the words away
