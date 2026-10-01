# parameter-system Specification

## Purpose
Every tunable value in the studio is declared once, as data, and everything else
is derived from that declaration: the control that edits it, the lock that holds
it, the range randomize draws from, and the validation a project file passes
through on load.

## Requirements

### Requirement: A parameter is declared as data

A parameter SHALL be declared by a `ParamDef` carrying an id, a label, a kind, a
default, and a `lockable` flag. The kind SHALL be one of `number`, `int`,
`angle`, `enum`, `bool` or `color`.

A `number`, `int` or `angle` definition SHALL carry a minimum and a maximum, and
MAY carry a step. An `enum` definition SHALL carry its options. A definition MAY
carry a `group` and an `advanced` flag as presentation hints, and a `randomize`
range or `false` to exclude it from randomize.

#### Scenario: A numeric parameter is declared

- **WHEN** a module declares a `number` parameter with a minimum of 1, a maximum
  of 20 and a default of 3
- **THEN** the definition is accepted
- **AND** its default, minimum and maximum are readable from it

#### Scenario: A numeric parameter is declared without a range

- **WHEN** a `number`, `int` or `angle` definition omits its minimum or maximum
- **THEN** the declaration is rejected, naming the parameter id

#### Scenario: A default outside the declared range

- **WHEN** a definition declares a minimum of 1, a maximum of 20 and a default
  of 25
- **THEN** the declaration is rejected, naming the parameter id and both values

#### Scenario: An enum parameter without options

- **WHEN** an `enum` definition omits its options, or declares a default that is
  not among them
- **THEN** the declaration is rejected, naming the parameter id

### Requirement: Stored values resolve against definitions

Resolving SHALL take a set of definitions and a record of stored values and
produce the concrete parameters a pure function receives. A parameter with no
stored value SHALL take its default. A stored value of the wrong kind SHALL be
rejected rather than coerced.

A stored value outside a declared range SHALL be clamped into it, and the
clamping SHALL be reported so a caller can warn rather than silently accept.

#### Scenario: A value is missing

- **WHEN** resolution runs with no stored value for a parameter
- **THEN** the result holds that parameter's default

#### Scenario: A value is out of range

- **WHEN** a stored value of 50 resolves against a definition with a maximum
  of 20
- **THEN** the result holds 20
- **AND** the resolution reports that the parameter was clamped, with both
  values

#### Scenario: A value is of the wrong kind

- **WHEN** a stored value is a string and the definition declares `number`
- **THEN** resolution fails, naming the parameter, the expected kind and what it
  found

#### Scenario: An integer parameter receives a fraction

- **WHEN** a stored value of 6.4 resolves against an `int` definition
- **THEN** resolution fails, naming the parameter

#### Scenario: A stored value names no declared parameter

- **WHEN** a record holds a value whose id matches no definition
- **THEN** resolution fails, naming the unknown id, so a renamed parameter is
  caught instead of silently ignored

### Requirement: Randomness comes from a stored seed

Random values SHALL come from a seeded generator, never from `Math.random()`.
The same seed SHALL produce the same sequence on every run and on every machine.

#### Scenario: Two generators share a seed

- **WHEN** two generators are created from the same seed and each is drawn from
  the same number of times
- **THEN** both produce identical sequences

#### Scenario: Two generators have different seeds

- **WHEN** two generators are created from different seeds
- **THEN** their sequences differ

#### Scenario: Values stay in range

- **WHEN** a generator is drawn from many times
- **THEN** every value is at least 0 and less than 1

### Requirement: Randomize respects locks

Randomize SHALL take definitions, current values, a set of locked parameter ids
and a seed, and return a new set of values. A locked parameter SHALL keep its
current value exactly. A parameter whose `randomize` is `false`, or which is not
`lockable` and declares no randomize range, SHALL keep its current value.

Every other parameter SHALL be drawn from its own `randomize` range when it
declares one, and from its declared minimum and maximum otherwise.

#### Scenario: A locked parameter is not moved

- **WHEN** randomize runs with a parameter's id in the locked set
- **THEN** that parameter's value in the result equals its value before

#### Scenario: An unlocked parameter is drawn from its randomize range

- **WHEN** a parameter declares a randomize range narrower than its full range
  and is not locked
- **THEN** its new value lies within the randomize range

#### Scenario: Randomize is reproducible

- **WHEN** randomize runs twice with the same definitions, values, locks and
  seed
- **THEN** both results are identical

#### Scenario: An enum parameter is randomized

- **WHEN** an unlocked `enum` parameter is randomized
- **THEN** its new value is one of its declared options

#### Scenario: Every parameter is locked

- **WHEN** randomize runs with every parameter locked
- **THEN** the result equals the input values exactly
