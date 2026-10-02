## ADDED Requirements

### Requirement: The couplings are one named function

The amplitude's effect on the letter width and the fit size's effect on the
x-height SHALL be one function from the parameters to those two values, named
and tested, rather than arithmetic written where each is used.

When the proportions stage is off, the letter width SHALL be 1 and the x-height
SHALL be the grid's own.

#### Scenario: The width follows the amplitude

- **WHEN** the amplitude changes and proportions are on
- **THEN** the letter width is `0.78 + 0.5 * (1 - e^(-(A - 1) / 4))`

#### Scenario: The x-height follows the fit size

- **WHEN** the fit size changes and proportions are on
- **THEN** the x-height is `min(capHeight - 16, xHeight * (1 + 0.22 * fit))`

#### Scenario: Proportions off

- **WHEN** proportions are off
- **THEN** the letter width is 1 and the x-height is the grid's 56

#### Scenario: The ceiling holds

- **WHEN** the fit size would push the x-height above the cap height less 16
- **THEN** it is held there
