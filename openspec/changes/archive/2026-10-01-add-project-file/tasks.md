## 1. The state

- [x] 1.1 Carry the template version alongside the template id, set when a
  template is chosen. Verify choosing a template records its version.

## 2. The file format

- [x] 2.1 Define the project file as the state plus a format version, with the
  current version named once. Verify a saved file holds every field the scope
  lists.
- [x] 2.2 Verify a project carrying a custom formula, a modulation list, patches
  and pairs round-trips through the file unchanged.
- [x] 2.3 Verify the scene built from a reopened project is identical to the one
  built before saving.

## 3. Validation

- [x] 3.1 Validate a loaded file field by field, collecting every problem.
  Verify a wrong type is named with the field and the expected type.
- [x] 3.2 Verify a file with several problems reports all of them.
- [x] 3.3 Verify text that is not JSON is refused with its own message.

## 4. Versions

- [x] 4.1 Add the migration list and run the steps in order from the file's
  version to the current one. Verify a two-step chain runs both steps in order.
- [x] 4.2 Verify a file at the current version runs no migration.
- [x] 4.3 Verify a file from a newer version is refused with both version
  numbers in the message.

## 5. The studio

- [x] 5.1 Save the project to a file. Verify in the browser that the download
  holds the project.
- [x] 5.2 Open a project from a file as one command. Verify in the browser that
  the studio draws it and that one undo returns to what was open before.
- [x] 5.3 Verify in the browser that opening a refused file keeps the open
  project and shows the report.

## 6. Verification

- [x] 6.1 Verify coverage thresholds hold, `nix flake check` is green and
  `pnpm e2e` is green.
