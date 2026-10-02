## ADDED Requirements

### Requirement: Outlining a skeleton produces closed contours

Outlining a working skeleton SHALL produce closed contours and nothing else: no
stroke to be widened later, no mask, and no fill rule a later tool has to agree
with.

Every contour SHALL hold at least three points and no coordinate that is not
finite.

#### Scenario: A stem

- **WHEN** a single run is outlined
- **THEN** a closed contour comes back, with the run inside it

#### Scenario: Any glyph, any parameters

- **WHEN** any glyph is outlined for any amplitude, rotation, pen and ending
- **THEN** every contour holds three points or more and no value that is not
  finite

#### Scenario: A ring

- **WHEN** a closed ring is outlined
- **THEN** two contours come back, the outside and the inside, so the counter
  stays open

### Requirement: A joint is covered by a stamp of the pen

Where two runs meet, a stamp of the pen SHALL be drawn, so the two read as one
stroke rather than two that happen to abut.

A dot SHALL be drawn the same way, as a stamp at its own size.

A stroke that is not split SHALL produce no stamp, and two separate strokes that
merely cross SHALL produce none either, because neither is a joint.

#### Scenario: One stroke that turns

- **WHEN** a stroke turns sharply enough to be split into two runs
- **THEN** a stamp is drawn at the point they share

#### Scenario: Two strokes that cross

- **WHEN** a glyph is two separate strokes crossing, as a T is
- **THEN** no stamp is drawn, because there is no joint

#### Scenario: A dot

- **WHEN** a glyph holds a dot
- **THEN** it is drawn as a stamp of the pen at the dot's size

### Requirement: An ending can cut the outline or add to it

An ending SHALL be able to add geometry beside the stroke, to cut the stroke's
own outline, or to change its width along the run, and SHALL declare which.

The three are different operations and collapsing them into one is how the
prototype ends up with a function that draws a serif, moves an offset point and
rescales a width in the same branch.

#### Scenario: An ending that adds

- **WHEN** a round or ball ending is applied
- **THEN** a shape is added beside the stroke and the outline is unchanged

#### Scenario: An ending that cuts

- **WHEN** an angled ending is applied
- **THEN** the outline's end points move and nothing is added

#### Scenario: An ending that changes the width

- **WHEN** a taper or flare ending is applied
- **THEN** the stroke's own width changes along the run
