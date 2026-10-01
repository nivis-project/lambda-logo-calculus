# brand-sheet Specification

## Purpose
TBD - created by archiving change add-brand-sheet. Update Purpose after archive.

## Requirements

### Requirement: The sheet holds the mark, both lockups, the clear space and the palette

A brand sheet SHALL hold, on one page: the mark on its own, the mark beside the
text, the mark above the text, the clear space drawn around the mark, and the
palette as labelled swatches. Each section SHALL carry a heading.

#### Scenario: What is on the sheet

- **WHEN** a brand sheet is composed
- **THEN** it holds the mark, the side lockup, the stacked lockup, a clear space
  frame and one swatch for every colour in the palette

#### Scenario: Each section is named

- **WHEN** a brand sheet is composed
- **THEN** each section carries a heading naming it

#### Scenario: Nothing runs off the page

- **WHEN** a brand sheet is composed
- **THEN** every piece of its geometry lies inside the page

### Requirement: Clear space comes from the mark's drawn outline

The clear space SHALL be a fraction of the mark's drawn height, measured from
the geometry the mark draws rather than from the box it was rendered into. It
SHALL be drawn as a frame around the mark, so the rule is visible rather than
stated.

#### Scenario: Clear space follows the mark

- **WHEN** a mark twice as tall is placed on a sheet
- **THEN** its clear space is twice as wide

#### Scenario: Empty corners do not count

- **WHEN** a mark whose viewBox is far larger than its geometry is placed
- **THEN** the clear space comes from the geometry, not the viewBox

#### Scenario: The frame surrounds the mark

- **WHEN** a clear space frame is drawn
- **THEN** its inner edge is the mark's outline and its outer edge is that
  outline grown by the clear space on every side

### Requirement: A swatch shows its colour and says what it is

Every colour in the palette SHALL be drawn as a filled swatch with its value
written beside it.

#### Scenario: One swatch per colour

- **WHEN** a palette of six colours is drawn
- **THEN** there are six swatches

#### Scenario: A swatch is labelled

- **WHEN** a swatch is drawn
- **THEN** the colour it holds is written next to it

### Requirement: The sheet is an exporter

The brand sheet SHALL be registered as an exporter alongside the others, with
its own parameter definitions, and SHALL write through the same call.

#### Scenario: The sheet in the registry

- **WHEN** the exporter registry is read
- **THEN** the brand sheet is in it

#### Scenario: A sheet is written

- **WHEN** the brand sheet exporter runs
- **THEN** it writes a file holding the whole sheet
