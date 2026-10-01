## Why

Epic [lambda-logo-calculus-sdwv](../../../.beans/lambda-logo-calculus-sdwv--custom-formula-parser-without-eval.md),
under milestone 03 Templates and registries.

Five built-in templates is a gallery. The brief asks for an open end: a designer
duplicates any template, types their own formula, and gets a new base curve with
its own sliders.

The constraint is absolute and is written into `AGENTS.md` as an architecture
rule: no `eval`, and no `Function` constructor. A formula typed into a text box
is untrusted input, and this is a web application that will one day load a
project file someone else made.

A restricted parser is also better for the designer than `eval` would be. It can
say which character it did not understand, refuse an unknown name instead of
silently producing `undefined`, and guarantee termination.

## What Changes

- Add a tokeniser and a recursive descent parser producing an expression tree.
- Add an evaluator over that tree with a function whitelist: `sin`, `cos`, `tan`,
  `abs`, `pow`, `sqrt`, `min`, `max`, `clamp`, `floor`, `ceil`, `round`, and the
  constants `pi` and `e`.
- Support the operators a formula needs: `+ - * / %`, exponentiation, unary
  minus, parentheses, and comparison only where `clamp` and `min`/`max` make it
  unnecessary, so no boolean algebra is admitted.
- Reject anything else: an unknown identifier, an unknown function, a wrong
  argument count, property access, assignment, a call on a non-function, and any
  character outside the grammar. Every rejection names the position.
- Add the custom template: a registered `ShapeTemplate` whose radius or point
  comes from a parsed formula, declaring the parameters the designer names.
- Store the formula text and the declared parameters in the template, so a
  project file reopens identically.

## Capabilities

### New Capabilities

- `custom-formula`: what a designer may type, what the studio refuses, and the
  guarantees that make it safe to evaluate.

### Modified Capabilities

None.

## Impact

- New under `packages/core/src/formula`: the tokeniser, the parser, the
  evaluator and the whitelist.
- No new dependency. mathjs and expr-eval were both candidates in the brief;
  writing roughly 300 lines is cheaper than auditing either for the one property
  that matters, which is that nothing reaches a global.
- The parser is pure and lives in the core, so it is covered by the boundary
  check and the determinism rule like everything else there.
- A formula is parsed once and evaluated many times, so the parse result is the
  thing stored, not the text. The text is kept alongside it for the project file
  and for showing the designer what they typed.
- Evaluation must terminate: the grammar has no loops and no recursion, so a
  parsed formula is a finite tree and evaluating it is bounded by its size.
