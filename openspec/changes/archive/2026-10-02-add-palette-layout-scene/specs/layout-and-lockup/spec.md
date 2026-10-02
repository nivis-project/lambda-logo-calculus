## ADDED Requirements

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
