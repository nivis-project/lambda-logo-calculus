## ADDED Requirements

### Requirement: The studio has an export panel generated from the exporter

The studio SHALL offer a panel listing the registered exporters, and SHALL
generate its controls from the chosen exporter's parameter definitions, the way
every other panel is generated. Exporting SHALL write a file named after the
project's text and the exporter's extension.

#### Scenario: Choosing an exporter

- **WHEN** a different exporter is chosen
- **THEN** the panel shows that exporter's parameters and no others

#### Scenario: Exporting

- **WHEN** the designer exports
- **THEN** a file is written with the chosen exporter's extension

#### Scenario: An export that cannot run

- **WHEN** an export fails
- **THEN** the studio says what went wrong and keeps the project open
