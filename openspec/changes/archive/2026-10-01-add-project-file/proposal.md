## Why

Epic [lambda-logo-calculus-0ocs](../../../.beans/lambda-logo-calculus-0ocs--versioned-project-file-format.md),
under milestone 05 Lockup, modulation and project files.

The studio autosaves to the browser and restores on reopen, which is enough to
survive a reload and nothing more. A designer cannot hand a logo to a colleague,
keep two versions of it side by side, or put one in a repository.

The brief asks for a project file: the data plus a version number, reopening
exactly as it was saved. Two of those words carry the work. "Exactly" means the
file has to hold every piece of state the scene reads, which is now a longer
list than when the store was written. "Version number" means a file written
today has to be readable by a studio shipped later, so the version has to be
checked on load and there has to be somewhere for a migration to live before the
first one is needed.

## What Changes

- Give the project state the template's version alongside its id, so a file
  records which template it was drawn with.
- Define the file as the project state plus the format version, and validate it
  on load field by field, reporting what is wrong and where rather than failing
  with "invalid project".
- Add the migration path: a registered list of steps from one version to the
  next, run in order on load. It ships empty, because version 1 is the first.
- Refuse a file from a newer version than the studio knows, by name, rather than
  guessing at it.
- Save the project to a file and open one from disk, next to the autosave that
  already restores on reopen.

## Capabilities

### New Capabilities

- `project-file`: the file format, its version, what validation reports, how a
  migration runs, and saving to and opening from disk.

### Modified Capabilities

- `command-store`: the project state carries the template version, and the list
  of what the state holds grows to the modulation list, the per-glyph patches
  and the spacing pairs.

## Impact

- New under `packages/store/src/project.ts`, with the studio's save and open
  controls in `apps/studio`.
- Validation reports a list of problems rather than throwing on the first one,
  because a designer handed a file written by an older build wants to know
  everything that is wrong with it, not the first thing.
- A migration is a pure function from one version's shape to the next, so the
  chain can be tested without a file and without the studio.
- An unknown template or palette id is not a file error. The file is valid; the
  studio refuses to draw it and says which module is missing, which is a
  different message and a different fix.
