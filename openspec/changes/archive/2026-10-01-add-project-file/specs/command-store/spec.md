## MODIFIED Requirements

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
