# project-file Specification

## Purpose
TBD - created by archiving change add-project-file. Update Purpose after archive.

## Requirements

### Requirement: A project file is the state plus a format version

A project file SHALL be JSON holding the project state and a format version
number. The state SHALL carry the template id and version, the template
parameters including any custom formula text, the stage list and its parameters,
the modulation entries, the per-glyph patches, the spacing pairs, the ending,
the join, the palette, the mark settings, the text, the nesting values, the set
of locked parameters and the random seed.

#### Scenario: A saved file reopens as it was saved

- **WHEN** a project is saved to a file and that file is opened again
- **THEN** the restored project equals the saved one
- **AND** the scene built from it is identical

#### Scenario: Every piece of state is in the file

- **WHEN** a project with a custom formula, a modulation list, per-glyph patches
  and spacing pairs is saved
- **THEN** all four are present in the file and restored from it

### Requirement: A file is validated on load and the report names the field

Loading SHALL validate the file against the schema before it is accepted. A file
that does not validate SHALL be refused with a report naming every field that is
wrong and what was expected, rather than one message for the whole file.

#### Scenario: A field of the wrong type

- **WHEN** a file whose copy count is a string is loaded
- **THEN** it is refused, and the report names the copy count and the type it
  expected

#### Scenario: Several fields are wrong

- **WHEN** a file has more than one problem
- **THEN** the report names all of them, not only the first

#### Scenario: A file that is not JSON

- **WHEN** the text is not JSON at all
- **THEN** it is refused with a message saying so, and the studio keeps the
  project it already had

### Requirement: A version older than the current one is migrated

Loading SHALL run the registered migrations in order from the file's version up
to the current version. A migration SHALL be a pure function from one version's
shape to the next.

#### Scenario: An older file is migrated

- **WHEN** a file written at an older version is loaded
- **THEN** each migration from that version up to the current one runs in order
- **AND** the result validates against the current schema

#### Scenario: The current version needs no migration

- **WHEN** a file at the current version is loaded
- **THEN** no migration runs and the state is used as it is

### Requirement: A file from a newer version is refused by name

A file whose version is higher than the studio's SHALL be refused with a message
naming both versions. The studio SHALL NOT guess at a format it does not know.

#### Scenario: A file from the future

- **WHEN** a file whose version is higher than the studio's is loaded
- **THEN** it is refused with a message naming the file's version and the
  studio's

### Requirement: A project saves to a file and opens from one

The studio SHALL save the project to a file the designer names, and SHALL open a
project from a file chosen from disk. Opening SHALL be one command, so it undoes.

#### Scenario: Saving

- **WHEN** the designer saves
- **THEN** a JSON file holding the project is written

#### Scenario: Opening

- **WHEN** the designer opens a saved file
- **THEN** the studio draws that project
- **AND** one undo returns to the project that was open before

#### Scenario: Opening a file that is refused

- **WHEN** the chosen file does not validate
- **THEN** the studio keeps the project it had and shows the report
