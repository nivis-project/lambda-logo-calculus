---
# lambda-logo-calculus-sdwv
title: Custom formula parser without eval
status: todo
type: epic
priority: normal
created_at: 2026-09-30T22:04:36Z
updated_at: 2026-09-30T22:04:44Z
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

- [ ] Add the restricted parser with the function whitelist
- [ ] Prove `eval` and `Function` are absent, by test and by lint rule
- [ ] Let a custom template declare its own parameters
- [ ] Version custom templates in the project format
- [ ] Report parse and validation errors as designer-facing messages
- [ ] Property test: no whitelisted formula can reach a global
