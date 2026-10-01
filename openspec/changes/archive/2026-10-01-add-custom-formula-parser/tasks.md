## 1. Tokeniser

- [x] 1.1 Tokenise numbers, identifiers, operators and parentheses, each
  carrying its position. Verify a formula tokenises to the expected sequence.
- [x] 1.2 Reject any character outside the grammar, naming the character and its
  position. Verify with a dot, a square bracket, a semicolon, a quote and a
  backtick.

## 2. Parser

- [x] 2.1 Parse with correct precedence: exponentiation above unary minus above
  multiplication above addition. Verify against hand-computed values.
- [x] 2.2 Parse calls to whitelisted functions, checking the argument count.
  Verify `clamp` with two arguments fails naming how many it expects.
- [x] 2.3 Reject an unknown identifier and an unknown function, naming each and
  its position.
- [x] 2.4 Reject an unbalanced parenthesis and an empty formula, each with a
  message saying what was expected.
- [x] 2.5 Bound the nesting depth so a deeply nested formula fails with a depth
  message rather than overflowing the stack. Verify with a formula nested past
  the bound.

## 3. Evaluator

- [x] 3.1 Evaluate the tree against a set of variable bindings. Verify every
  whitelisted function and constant against hand-computed values.
- [x] 3.2 Report a non-finite result rather than returning it into the geometry.
  Verify with a division by zero.
- [x] 3.3 Property test: for random formulas built from the grammar and random
  bindings, evaluation terminates and returns a number or a reported failure.

## 4. Safety

- [x] 4.1 Verify the built core bundle contains no `eval`, no `Function`
  constructor and no dynamic `import`, extending the boundary check.
- [x] 4.2 Property test: no formula the parser accepts can read a global. Drive
  it with a list of known escape attempts as well as random input.
- [x] 4.3 Verify a formula naming a global that happens to exist in the host is
  still rejected, because the whitelist is the only source of names.

## 5. The custom template

- [x] 5.1 Build a `ShapeTemplate` from a parsed formula, declaring the
  designer's parameters. Verify it registers, samples and nests like any other.
- [x] 5.2 Verify the designer's parameters appear as parameter definitions with
  their declared ranges.
- [x] 5.3 Verify a custom template rebuilt from its stored formula text and
  parameters produces the same curve.
- [x] 5.4 Verify a formula that produces an invalid curve is reported through
  curve validation rather than drawn.

## 6. Verification

- [x] 6.1 Verify `packages/core` coverage is at or above 80%.
- [x] 6.2 Verify `nix flake check` is green.
