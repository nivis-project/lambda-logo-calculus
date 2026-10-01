---
# lambda-logo-calculus-sdwv
title: Custom formula parser without eval
status: completed
type: epic
priority: normal
created_at: 2026-09-30T22:04:36Z
updated_at: 2026-10-01T07:06:01Z
parent: lambda-logo-calculus-eihe
blocked_by:
    - lambda-logo-calculus-koee
---

The open end of the template system. A designer duplicates any template into an
editable formula and types `r(theta)` or `x(t), y(t)`. The formula is parsed,
never run as code.

## Scope

- A restricted expression parser with a function whitelist: sin, cos, abs, pow,
  min, max, clamp, pi. No `eval`, no `Function` constructor.
- Custom templates declare their own parameters, which appear as sliders.
- A project stores template id, version, parameters, and for custom templates
  the formula text, so a file reopens identically.
- Parse errors and validation failures are reported to the designer, not thrown
  into the console.

## Todo

- [x] Add the restricted parser with the function whitelist
- [x] Prove `eval` and `Function` are absent, by test and by lint rule
- [x] Let a custom template declare its own parameters
- [x] Version custom templates in the project format
- [x] Report parse and validation errors as designer-facing messages
- [x] Property test: no whitelisted formula can reach a global

## Summary of Changes

The template system has its open end, and it cannot execute what a designer
types. 347 tests.

- A tokeniser carrying a position on every token, which refuses any character
  outside the grammar. Ten refused characters are tested by name: `.`, `[`, `;`,
  a quote, a backtick, `=`, `&`, `|`, `?` and `{`. Property access, indexing,
  assignment, strings and boolean algebra are all excluded by that one rule.
- A recursive descent parser with the precedence a formula expects, verified
  against hand-computed values: `2 ** 3 ** 2` is 512 and `-2 ** 2` is -4. It
  refuses an unknown identifier, an unknown function, a wrong argument count
  naming how many it expects, an unbalanced parenthesis, trailing input, a
  dangling operator, and an empty formula.
- Nesting depth is bounded at 32, so a formula nested past it fails with a depth
  message rather than overflowing the stack.
- An evaluator over the tree, with twelve whitelisted functions and two
  constants. A non-finite result is reported rather than returned into the
  geometry: `1 / 0` and `sqrt(-1)` both come back as a failure with a reason.
- `buildCustomTemplate` turns a formula into a registered `ShapeTemplate` that
  samples and nests like any other, in both polar and parametric form. A
  template rebuilt from its stored text and parameters produces an identical
  curve, which is what makes a project file reopen the same.

No dependency was added. mathjs and expr-eval were both in the brief; roughly
300 lines is cheaper than auditing either for the one property that matters.

**The safety claim is tested rather than asserted.** Eighteen named escape
attempts are refused, including `constructor`, `globalThis`, `Function`, `eval`,
`__proto__`, `this`, `A.constructor` and `cos.constructor`. A name that exists
in the host but is not whitelisted (`Math`, `NaN`, `Infinity`, `undefined`) is
refused too, because the whitelist is the only source of names. A property test
over random identifiers confirms a name resolves if and only if it is a declared
parameter, the curve variable or a whitelisted constant.

The built-bundle boundary check now also bans `eval`, the `Function` constructor
and dynamic `import` in `packages/core`, and was verified by injecting an `eval`
into the built output and watching it fail.

Capability `custom-formula` is a main spec with six requirements and twenty
scenarios.

OpenSpec change archived as `2026-10-01-add-custom-formula-parser`.
