---
# lambda-logo-calculus-eihe
title: 03 Templates and registries
status: todo
type: milestone
created_at: 2026-09-30T22:01:03Z
updated_at: 2026-09-30T22:01:03Z
---

The base curve stops being hard-coded. A designer picks a template from a
gallery, tunes its parameters, and can duplicate any template into an editable
custom formula. Nesting works for polar and parametric templates alike.

Built-in templates for the first release: trefoil, rose, superellipse,
supershape, rounded polygon and custom formula.

## Gate

Every built-in template renders the fixed test string to an approved golden
snapshot, nesting holds for parametric templates, and a custom formula typed by
the designer is parsed, validated and rendered without `eval`.
