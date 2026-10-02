## 1. Parameters

- [x] 1.1 Define the parameter kinds and the shape of a declaration. Verify a
  declaration of each of the six kinds type-checks and carries a default.
- [x] 1.2 Resolve values against declarations, returning the values and a report
  of everything clamped. Verify an in-range value passes untouched and an
  out-of-range one is reported with both numbers.
- [x] 1.3 Refuse a value of the wrong kind and a value for an undeclared id.
  Verify each fails with the id in the message.

## 2. The registry

- [x] 2.1 Add a typed registry that takes a kind and refuses a module missing an
  id, an integer version or a label. Verify each refusal names what is missing.
- [x] 2.2 Refuse a duplicate id, and name the kind when fetching an unknown one.
  Verify both.

## 3. The seed

- [x] 3.1 Add a seeded random source. Verify the same seed gives the same
  sequence and a different seed a different one.
- [x] 3.2 Randomize from a seed, respecting locks and the randomisable flag.
  Verify a locked parameter and a non-randomisable one are both left alone.
- [x] 3.3 Verify randomize stays inside each parameter's randomize range, over
  many seeds.

## 4. Verification

- [x] 4.1 Verify the gate is green and the core stays above its coverage floor.
