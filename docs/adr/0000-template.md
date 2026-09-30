# NNNN. Title in a short noun phrase

- Status: proposed | accepted | superseded by [NNNN](NNNN-title.md)
- Date: YYYY-MM-DD
- Change: `openspec/changes/<change-name>` or its archived path

## Context

What forces are at play. The constraint, the problem, the thing that made a
choice necessary. Written so someone who arrives in a year understands the
situation without reading the code.

State facts, not the conclusion. If this section already argues for the
decision, it is written wrong.

## Decision

The choice, in the active voice and the present tense. "We use X." Not "we will
use X" and not "X was chosen".

One decision per record. A record that decides three things is three records.

## Consequences

What becomes easier, what becomes harder, and what is now closed off. The
negative consequences matter most; a record that lists only benefits is a
advertisement, not a decision record.

## Alternatives considered

Each alternative that was genuinely on the table, with the reason it lost. An
alternative dismissed in one line was not considered, so either write the real
reason or leave it out.

---

## How these records are maintained

- Numbered in sequence, starting at 0001. Never renumber.
- An ADR is written before the choice is implemented, not after.
- A record that is superseded is **marked, not deleted**: set its Status to
  `superseded by [NNNN](NNNN-title.md)` and leave the rest untouched. The
  superseding record explains what changed.
- A record that turned out wrong is superseded, not edited. The wrong decision
  and the reason it was made are the useful part of the history.
