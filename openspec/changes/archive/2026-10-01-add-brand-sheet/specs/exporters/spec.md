## ADDED Requirements

### Requirement: The exporters write text

The SVG and PDF exporters SHALL write a scene's text nodes. The PDF SHALL use a
standard font rather than embedding one, and SHALL write text the right way up
despite the page's flipped coordinate system.

#### Scenario: Text in an exported SVG

- **WHEN** a scene holding text is exported as SVG
- **THEN** the file holds that string in a text element at its position

#### Scenario: Text in an exported PDF

- **WHEN** a scene holding text is exported as PDF
- **THEN** the file names a standard font in its resources and shows the string
- **AND** the text matrix undoes the page flip, so the text is the right way up

#### Scenario: A string that would break the file

- **WHEN** text holds a bracket or a backslash
- **THEN** the PDF escapes it, and the file still parses
