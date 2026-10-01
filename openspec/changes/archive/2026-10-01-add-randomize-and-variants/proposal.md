## Why

Epic [lambda-logo-calculus-420e](../../../.beans/lambda-logo-calculus-420e--seeded-randomize-locks-and-the-variant-strip.md),
under milestone 04 Studio shell and parameter UI.

Locks exist in the project and the controls write them, but nothing reads them,
because nothing randomises yet. `randomizeParams` has been in the core since
milestone 02 with its own property tests, and no path reaches it.

The brief is specific about why this matters: randomize respects locks, and each
result goes to the variant strip so good ones are not lost. A designer who
randomises six times and loses the third one has been given a worse tool than no
randomize at all.

## What Changes

- Add a randomize action to the top bar, drawing from the template's
  parameters, the nesting parameters and the letter choices.
- Respect the project's lock list: a locked parameter is not touched.
- Draw from the stored seed and advance it, so a result is reproducible from the
  project and a second press gives something different.
- Make each randomize a single command, so one press is one undo.
- Add every randomize result to the variant strip automatically.
- Add the variant strip to the bottom: a thumbnail per variant, restore on
  click, and remove.
- Let a designer take a variant by hand as well.

## Capabilities

### New Capabilities

- `randomize`: what randomize may change, what it must not, and how a result is
  reproduced.

### Modified Capabilities

- `command-store`: variants gain a thumbnail and a removal, and randomize is
  added as a command kind that produces one undoable step.

## Impact

- One new command kind, `randomize`, carrying the seed it used so the step is
  reproducible from the log alone.
- The variant strip stores a rendered thumbnail per variant. Thumbnails are
  rasterised images, as the size previews already are, so a strip of twenty
  variants costs twenty images rather than twenty live scene graphs.
- Variants are held in the store rather than the project, so they do not bloat a
  saved project file. Whether they should be saved is a milestone 05 question,
  when the project format is written.
- The seed advances on each randomize. A project reopened and randomised gives
  the same next result, which is what makes the seed worth storing.
