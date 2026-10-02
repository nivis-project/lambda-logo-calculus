# The prototype

`trefoil-type.html` is a working generative alphabet in one file of browser
JavaScript. A trefoil curve drives both a mark and the letters of a wordmark:
the same shape decides the nesting of the copies and the thickness of every
stroke in every direction.

It is the authority this project is measured against. Milestone 02 reads it and
writes down what it does. Milestone 03 builds to that description and proves the
result matches a recording of it. Both rest on this being the same file
throughout.

## It is frozen

`DIGEST` records its sha256 and its byte count, and the test suite checks the
file against them. A prototype that has changed fails the gate, loudly, saying
that everything measured against it is now suspect.

## What may be done to it

Read it. Open it in a browser. Drive its controls. Record what it renders.

What may not be done to it:

- Edited, for any reason, including to make a comparison easier. If comparing
  the port against the prototype is awkward, the port changes or the comparison
  changes.
- Reimplemented in part so that a recording can be produced without running it.
  A recording made that way proves only that two transcriptions agree.
- Reformatted, prettified or re-indented. The digest does not care why it
  changed.

## Replacing it deliberately

There is one legitimate reason: the prototype itself has moved on, and the
project should be measured against the newer one.

1. Put the new file at `reference/trefoil-type.html`.
2. Run `sha256sum reference/trefoil-type.html` and `wc -c` on it, and write both
   into `DIGEST`.
3. Run the gate. It should be green.
4. In the OpenSpec change that does this, say what moved and what has to be
   re-recorded because of it. A new prototype invalidates the parity fixture,
   and possibly some specs. Naming that is the point of doing it in a change
   rather than as an edit.

Both halves go in the same change. A digest updated without the file, or a file
updated without the digest, fails the gate.
