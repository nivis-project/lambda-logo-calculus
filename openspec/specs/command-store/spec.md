# command-store Specification

## Purpose
One store, and every change to it a command. Undo, redo, autosave and variant
snapshots are not four features; they are four readings of the same log.

## Requirements

### Requirement: The project state is one serialisable value

The project state SHALL hold everything a rendered logo depends on: the template
id and version and its parameters, the stage list, the ending, the join, the
palette, the text, the copy count, the rotation, the fit size, the opacity, the
mark settings, the modulation entries, the per-glyph patches, the spacing pairs,
the set of locked parameters and the random seed.

It SHALL be JSON-serialisable, so that saving it and sending it through the
command log are the same problem.

#### Scenario: The state round-trips through JSON

- **WHEN** a project state is serialised and parsed back
- **THEN** the result equals the original

#### Scenario: The state carries everything the scene needs

- **WHEN** a scene is built from a project state
- **THEN** no value is read from anywhere but that state

#### Scenario: The state records which template version drew it

- **WHEN** a template is chosen
- **THEN** the state carries that template's version alongside its id

### Requirement: Every edit is a command

A change to the project state SHALL be made by applying a command. A command
SHALL be a serialisable object naming what it does and carrying its payload.

Applying a command SHALL produce the next state together with the patch that
made it and the patch that reverses it.

#### Scenario: A command is applied

- **WHEN** a command setting a parameter is applied
- **THEN** the state carries the new value
- **AND** the log gains an entry with a forward and an inverse patch

#### Scenario: A command is serialisable

- **WHEN** any command is serialised and parsed back
- **THEN** applying the parsed command gives the same result as the original

#### Scenario: The state is not mutated in place

- **WHEN** a command is applied
- **THEN** the state object that was passed in is unchanged

#### Scenario: An unknown command

- **WHEN** a command naming no known kind is applied
- **THEN** it is refused, naming the kind, and the state is unchanged

### Requirement: Undo and redo walk the log

Undo SHALL apply the inverse patch of the most recent entry and step back. Redo
SHALL apply the forward patch of the next entry and step forward.

Applying a new command after an undo SHALL discard the entries ahead of the
current position, because they describe a future that no longer follows.

#### Scenario: Undo restores the previous state

- **WHEN** a command is applied and then undone
- **THEN** the state equals what it was before the command

#### Scenario: Redo reapplies it

- **WHEN** a command is undone and then redone
- **THEN** the state equals what it was after the command

#### Scenario: Undo at the start of the log

- **WHEN** undo is called with nothing to undo
- **THEN** the state is unchanged and the store reports there was nothing

#### Scenario: Redo at the end of the log

- **WHEN** redo is called with nothing to redo
- **THEN** the state is unchanged and the store reports there was nothing

#### Scenario: A new command after an undo

- **WHEN** a command is applied, undone, and a different command applied
- **THEN** redo has nothing to redo

#### Scenario: Many edits undo in order

- **WHEN** a sequence of commands is applied and then undone one at a time
- **THEN** the state passes back through each intermediate value in reverse

### Requirement: Variants are named positions in the log

A variant snapshot SHALL record a name, the state at that moment, and a
thumbnail of what that state renders. Restoring a variant SHALL be itself a
command, so it can be undone.

A variant SHALL be removable. Variants SHALL live in the store rather than in
the project, so they do not enter a saved project file.

#### Scenario: A variant is taken and restored

- **WHEN** a variant is taken, the state changed, and the variant restored
- **THEN** the state equals what it was when the variant was taken

#### Scenario: Restoring a variant can be undone

- **WHEN** a variant is restored and then undone
- **THEN** the state equals what it was before the restore

#### Scenario: Variants survive unrelated edits

- **WHEN** several variants are taken and unrelated commands applied
- **THEN** every variant still restores the state it recorded

#### Scenario: A variant carries a thumbnail

- **WHEN** a variant is taken with a thumbnail
- **THEN** that thumbnail is readable from the variant

#### Scenario: A variant is removed

- **WHEN** a variant is removed by name
- **THEN** it is gone and the others remain

### Requirement: Autosave writes through an interface, not to a global

The store SHALL write its state through a storage interface it is given. It
SHALL NOT name `localStorage` or any other browser global.

Autosave SHALL be debounced, so a slider drag does not write once per frame.

#### Scenario: State is saved

- **WHEN** a command is applied and the debounce elapses
- **THEN** the storage receives the serialised state once

#### Scenario: Rapid edits are collapsed

- **WHEN** many commands are applied within the debounce window
- **THEN** the storage receives one write, carrying the final state

#### Scenario: State is restored

- **WHEN** a store is created with storage holding a saved state
- **THEN** it starts from that state

#### Scenario: Stored state that cannot be read

- **WHEN** the storage holds something that is not a valid project state
- **THEN** the store starts from its defaults and reports that it could not
  restore, rather than throwing

### Requirement: The state cannot be changed outside a command

Changing the project state by any route other than applying a command SHALL be
detectable, and a test SHALL fail when it happens.

#### Scenario: A direct mutation is attempted

- **WHEN** code outside a command attempts to change the state object
- **THEN** the attempt fails, because the state is frozen

#### Scenario: Commands remain the only route

- **WHEN** the store's public surface is inspected
- **THEN** the only operations that change the project state are applying a
  command, undo, redo and restore

### Requirement: Randomize is a command kind

The store SHALL accept a `randomize` command carrying the definitions to draw
from, the seed to use, and the next seed to store. Applying it SHALL produce one
log entry.

#### Scenario: A randomize command is applied

- **WHEN** a randomize command is applied
- **THEN** the project's values change and its seed advances
- **AND** exactly one entry is added to the log

#### Scenario: A randomize command round-trips

- **WHEN** a randomize command is serialised and parsed back
- **THEN** applying the parsed command gives the same result
