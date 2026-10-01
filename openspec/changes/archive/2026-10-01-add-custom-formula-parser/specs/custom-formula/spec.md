## Purpose

The open end of the template system. A designer types a formula and gets a base
curve from it, without the studio ever executing what they typed as code.

## ADDED Requirements

### Requirement: A formula is parsed, never executed as code

A formula SHALL be turned into an expression tree by a parser and evaluated by
walking that tree. The studio SHALL NOT use `eval`, the `Function` constructor,
dynamic `import`, or any other mechanism that executes a string as code.

#### Scenario: A formula is evaluated

- **WHEN** a formula is parsed and evaluated
- **THEN** the result comes from walking an expression tree

#### Scenario: The forbidden mechanisms are absent

- **WHEN** the built core bundle is inspected
- **THEN** it contains no call to `eval`, no `Function` constructor and no
  dynamic `import`

### Requirement: Only whitelisted names resolve

An identifier SHALL resolve only to a declared parameter, the curve variable, or
a name on the whitelist. A function call SHALL resolve only to a whitelisted
function.

The whitelist SHALL be `sin`, `cos`, `tan`, `abs`, `pow`, `sqrt`, `min`, `max`,
`clamp`, `floor`, `ceil`, `round`, `pi` and `e`.

Anything else SHALL be rejected at parse time, naming the identifier and its
position.

#### Scenario: A whitelisted function is used

- **WHEN** a formula calls `cos` with one argument
- **THEN** it parses and evaluates

#### Scenario: An unknown function is called

- **WHEN** a formula calls a function that is not on the whitelist
- **THEN** parsing fails, naming the function and its position

#### Scenario: An unknown identifier is used

- **WHEN** a formula names an identifier that is neither a declared parameter,
  the curve variable, nor a whitelisted constant
- **THEN** parsing fails, naming the identifier and its position

#### Scenario: A whitelisted function is given the wrong number of arguments

- **WHEN** `clamp` is called with two arguments instead of three
- **THEN** parsing fails, naming the function and how many arguments it expects

### Requirement: Nothing in the grammar can reach a global

The grammar SHALL admit numbers, identifiers, calls to whitelisted functions,
parentheses, the operators `+ - * / %` and exponentiation, and unary minus.

It SHALL NOT admit property access, indexing, assignment, a function literal, a
string literal, a comma outside an argument list, or a semicolon.

#### Scenario: Property access is refused

- **WHEN** a formula contains a dot followed by a name
- **THEN** parsing fails, naming the position

#### Scenario: Indexing is refused

- **WHEN** a formula contains a square bracket
- **THEN** parsing fails, naming the position

#### Scenario: Assignment is refused

- **WHEN** a formula contains an assignment
- **THEN** parsing fails, naming the position

#### Scenario: A known escape attempt is refused

- **WHEN** a formula attempts to reach a global by any construction the grammar
  does not admit
- **THEN** parsing fails rather than evaluating

### Requirement: Every rejection names where it happened

A parse failure SHALL report the position in the formula text where it failed
and what it expected, so the studio can show the designer rather than logging to
a console the designer cannot see.

#### Scenario: An unbalanced parenthesis

- **WHEN** a formula opens a parenthesis it does not close
- **THEN** parsing fails, naming the position and what it expected

#### Scenario: A character outside the grammar

- **WHEN** a formula contains a character the grammar does not admit
- **THEN** parsing fails, naming the character and its position

#### Scenario: An empty formula

- **WHEN** an empty formula is parsed
- **THEN** parsing fails with a message saying so, rather than returning zero

### Requirement: Evaluation is total and terminates

Evaluating a parsed formula SHALL always terminate, because the grammar admits
no loop and no recursion. Evaluation SHALL return a number, and SHALL report
rather than propagate a result that is not finite.

#### Scenario: A formula that divides by zero

- **WHEN** a formula divides by zero at some input
- **THEN** evaluation reports a non-finite result rather than returning infinity
  into the geometry

#### Scenario: A deeply nested formula

- **WHEN** a formula nests parentheses deeply
- **THEN** parsing either succeeds or fails with a depth message, and never
  overflows the stack

#### Scenario: A formula is evaluated many times

- **WHEN** a parsed formula is evaluated at many values of the curve variable
- **THEN** every evaluation terminates and returns a number

### Requirement: A custom template is a template like any other

A custom formula SHALL become a registered `ShapeTemplate`, declaring the
parameters the designer named so they appear as sliders.

A project SHALL store the formula text alongside the template id and version, so
a file reopens identically.

#### Scenario: A custom template is registered

- **WHEN** a custom template is built from a formula and registered
- **THEN** it behaves as any other template: it samples, it nests, and it
  declares safety limits

#### Scenario: The designer's parameters become sliders

- **WHEN** a formula names a parameter the designer declared
- **THEN** that parameter appears in the template's parameter definitions

#### Scenario: A formula round-trips

- **WHEN** a custom template is stored and rebuilt from its stored text and
  parameters
- **THEN** it produces the same curve
