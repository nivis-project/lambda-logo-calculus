## 1. The freeze

- [x] 1.1 Record the prototype's sha256 in `reference/DIGEST`, alongside its
  byte count so a reader can sanity-check it by eye. Verify the recorded digest
  matches `sha256sum reference/trefoil-type.html`.
- [x] 1.2 Add a test that reads the prototype, hashes it and compares it against
  `reference/DIGEST`. Verify it passes, and that changing one byte of the
  prototype makes it fail with a message saying the prototype changed.
- [x] 1.3 Verify a missing prototype fails rather than passing: move the file
  aside, run the suite, confirm the failure names the missing file, restore it.
- [x] 1.4 Verify half a replacement fails in both directions: change the digest
  alone, then the prototype alone, confirming each fails.

## 2. The documents

- [x] 2.1 Write `reference/README.md` saying what the prototype is, that it is
  frozen, what may be done to it, and the procedure for replacing it
  deliberately. Verify the procedure works by following it: change the file,
  update the digest, confirm a green gate, then revert both.
- [x] 2.2 Expand `README.md` so someone who has just cloned the repository can
  tell what this is, what state it is in, and what to run first. Verify every
  command it names runs.
- [x] 2.3 Add `docs/adr/index.md` listing the decision records with one line
  each. Verify it lists every file in `docs/adr/` except the template.
- [x] 2.4 Add the prototype rule to `AGENTS.md`: frozen, digest-checked, and
  replaced only deliberately. Verify it points at `reference/README.md` rather
  than repeating the procedure.

## 3. Verification

- [x] 3.1 Verify `nix flake check` is green with the digest check in the suite.
