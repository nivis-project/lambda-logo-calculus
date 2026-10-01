# studio-shell Specification

## Purpose
The frame a designer works in. The panels follow the pipeline, so reading the
screen left to right is reading the order the geometry is built in.

## Requirements

### Requirement: The layout follows the pipeline

The studio SHALL present a top bar, a left panel for shape settings, a centre
canvas, a right panel for letter and lockup settings, and a bottom strip.

The canvas SHALL take the majority of the width. The layout SHALL assume a
screen of 1440 pixels or wider.

#### Scenario: The shell is rendered

- **WHEN** the studio loads
- **THEN** the top bar, left panel, canvas, right panel and bottom strip are all
  present

#### Scenario: The canvas dominates

- **WHEN** the shell is measured at 1440 pixels wide
- **THEN** the canvas is wider than either panel

### Requirement: Three artboards are present and each redraws

The canvas SHALL show three labelled artboards: the mark alone, the horizontal
lockup and the stacked lockup. Each SHALL redraw when the project changes.

The mark artboard SHALL show the mark by itself. The two lockup artboards SHALL
show the wordmark; placing the mark relative to it is the lockup registry's
work, which arrives in milestone 05. Until then the two lockup artboards differ
only in label, and this is a stated gap rather than an implied capability.

#### Scenario: The artboards are present

- **WHEN** the studio loads
- **THEN** three labelled artboards are shown: Mark, Horizontal lockup and
  Stacked lockup

#### Scenario: The mark artboard shows the mark alone

- **WHEN** the studio loads
- **THEN** the mark artboard draws one glyph's worth of passes, not the wordmark

#### Scenario: A change redraws every artboard

- **WHEN** a command changes the project
- **THEN** all three artboards redraw

### Requirement: The canvas zooms and pans

The canvas SHALL support zooming and panning, and SHALL offer a reset that
returns both to their starting values.

Zoom SHALL be bounded, so the view cannot be lost.

#### Scenario: Zooming in and out

- **WHEN** the designer zooms in and then out
- **THEN** the canvas scale changes and then returns

#### Scenario: Zoom is bounded

- **WHEN** the designer zooms in or out repeatedly
- **THEN** the scale stays within its bounds

#### Scenario: Reset

- **WHEN** the designer resets the view after zooming and panning
- **THEN** the scale and the offset return to their starting values

### Requirement: Overlays are switchable and draw from the real geometry

The canvas SHALL offer overlay layers for grid lines, skeletons, the nib shape,
the outline bounds and the mark's optical box. Each SHALL be switchable
independently.

An overlay SHALL draw from the geometry the pipeline produced, not from a
separate approximation of it.

#### Scenario: An overlay is switched on

- **WHEN** the grid overlay is switched on
- **THEN** the baseline, x-height, cap-height and descender lines are drawn at
  the positions the grid metrics give

#### Scenario: Overlays are independent

- **WHEN** one overlay is switched on and another off
- **THEN** only the one that is on is drawn

#### Scenario: The skeleton overlay follows the stages

- **WHEN** the skeleton overlay is on and a stage is disabled
- **THEN** the skeleton drawn is the one that stage list produces

### Requirement: The bottom strip carries the text and the small sizes

The bottom strip SHALL hold the text field and a preview of the wordmark at 16,
32, 64 and 128 pixels, on a light and on a dark background.

Typing in the text field SHALL change the project through a command.

#### Scenario: Typing changes the wordmark

- **WHEN** the designer types in the text field
- **THEN** the wordmark redraws with the new text
- **AND** the change can be undone

#### Scenario: The small sizes are shown

- **WHEN** the studio loads
- **THEN** the wordmark appears at 16, 32, 64 and 128 pixels, on light and on
  dark

### Requirement: Keyboard shortcuts do what a designer expects

The studio SHALL bind undo, redo, zoom in, zoom out, reset zoom and toggling the
overlays to the keyboard.

A shortcut SHALL NOT fire while the designer is typing in a text field.

#### Scenario: Undo and redo from the keyboard

- **WHEN** the undo shortcut is pressed after a change
- **THEN** the change is undone
- **AND** the redo shortcut restores it

#### Scenario: A shortcut while typing

- **WHEN** a shortcut key is pressed inside the text field
- **THEN** the shortcut does not fire and the character is typed

### Requirement: Undo and redo are visible and honest

The top bar SHALL show undo and redo controls, each disabled when there is
nothing for it to do.

#### Scenario: Nothing to undo

- **WHEN** the studio loads with no edits made
- **THEN** the undo control is disabled

#### Scenario: Something to undo

- **WHEN** a change has been made
- **THEN** the undo control is enabled and the redo control is disabled
