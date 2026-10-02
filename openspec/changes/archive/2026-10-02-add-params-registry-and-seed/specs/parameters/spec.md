## ADDED Requirements

### Requirement: A parameter is declared as data

Every tunable value SHALL be declared once, as data carrying an id, a kind, a
range or set of options, a default, and whether it can be locked and randomized.

Panels, validation, locking and randomize SHALL all be derived from those
declarations. A control written by hand for one parameter SHALL be a defect,
because a parameter that exists in the interface and not in the declarations is
how a coupling gets added without anyone writing it down.

The kinds SHALL be: number, integer, angle, enumeration, boolean and colour.

#### Scenario: One declaration, many uses

- **WHEN** a parameter is declared
- **THEN** its range, default and behaviour come from that declaration wherever
  they are needed

#### Scenario: A parameter of each kind

- **WHEN** a parameter of each kind is declared
- **THEN** each resolves, validates and randomizes according to its kind

### Requirement: Resolution reports what it changed

Resolving a set of values against their declarations SHALL return the resolved
values together with a report of every value that was out of range, naming the
parameter, the value given and the value used.

The prototype clamps silently, which is how a slider can stop responding without
saying so. The port SHALL say so.

#### Scenario: A value in range

- **WHEN** a value lies within its parameter's range
- **THEN** it is used as given and nothing is reported

#### Scenario: A value out of range

- **WHEN** a value lies outside its parameter's range
- **THEN** it is brought into range, and the report names the parameter, what
  was given and what was used

#### Scenario: A value of the wrong kind

- **WHEN** a value is of a kind the parameter does not accept
- **THEN** resolution fails rather than coercing it

#### Scenario: A value for a parameter nobody declared

- **WHEN** a value is supplied for an id that is not declared
- **THEN** resolution fails and names the id

### Requirement: The port's randomize is reproducible

Randomize in the port SHALL draw from a seed stored with the project, never from
an unseeded source. The same seed and the same starting values SHALL give the
same result.

This is a deliberate departure from the prototype, which draws unseeded and
cannot return to a result. A generated logo nobody can get back to is not a
tool, and reproducibility is cheap.

#### Scenario: The same seed twice

- **WHEN** randomize runs twice from the same seed and the same values
- **THEN** the two results are identical

#### Scenario: A different seed

- **WHEN** randomize runs from a different seed
- **THEN** the result differs

#### Scenario: A locked parameter

- **WHEN** a parameter is locked
- **THEN** randomize leaves it alone whatever the seed is

#### Scenario: A parameter that is not randomisable

- **WHEN** a parameter is declared as not randomisable
- **THEN** randomize leaves it alone even when it is unlocked
