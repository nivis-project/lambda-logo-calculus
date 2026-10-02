# studio-shell Specification

## Purpose
A page a designer can open: the logo drawn, and redrawn whenever anything that
shapes it changes.

## Requirements

### Requirement: The studio draws the logo from the scene graph

The studio SHALL render what the engine returns and SHALL NOT compute geometry
of its own.

A calculation in the application is a calculation the parity comparison never
sees, so anything that decides where a point goes belongs in the engine.

#### Scenario: The page opens

- **WHEN** the studio is opened
- **THEN** the logo is drawn, with the mark and the letters

#### Scenario: No geometry in the application

- **WHEN** the studio's sources are inspected
- **THEN** they hold no stroking, no nesting and no glyph mathematics

### Requirement: The studio redraws when something changes

Every change that affects the drawing SHALL go through one path that rebuilds
the scene and redraws it. There SHALL NOT be a second way to update the page.

#### Scenario: The text changes

- **WHEN** the text is typed into
- **THEN** the logo redraws with the new text

#### Scenario: One path

- **WHEN** the studio's sources are inspected
- **THEN** one function rebuilds and redraws, and everything that changes state
  calls it

### Requirement: The studio states the width it lays out in

The studio SHALL pass the width it has to the engine, rather than the engine
reading it from anywhere.

#### Scenario: A width is passed

- **WHEN** the studio builds a logo
- **THEN** it supplies the available width as an input

### Requirement: An empty text says so

With no text, the studio SHALL say what to do rather than drawing nothing.

#### Scenario: The field is emptied

- **WHEN** the text field is cleared
- **THEN** the studio shows a prompt instead of an empty frame
