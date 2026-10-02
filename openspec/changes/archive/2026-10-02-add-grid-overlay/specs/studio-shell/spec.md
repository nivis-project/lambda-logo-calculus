## ADDED Requirements

### Requirement: The grid lines can be shown

The studio SHALL offer a switch that shows the grid lines over the drawing, off
when the page opens.

Turning it on SHALL redraw through the one path that every other change goes
through, and SHALL change nothing about the letters.

#### Scenario: Turning the grid on

- **WHEN** the grid switch is turned on
- **THEN** the rules and the character boxes appear over the drawing

#### Scenario: Turning it off again

- **WHEN** the switch is turned off
- **THEN** no guide is left in the drawing
