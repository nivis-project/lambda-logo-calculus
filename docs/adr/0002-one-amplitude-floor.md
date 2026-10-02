# 0002. One amplitude floor, applied everywhere

- Status: accepted
- Date: 2026-10-02
- Change: `openspec/changes/archive/<add-curve-and-nesting>`

## Context

The prototype contains one line, `Math.max(state.A, 1.15)`, used wherever the
curve reshapes a glyph. It is not used where the curve is drawn, nor where the
nesting is computed.

The amplitude slider runs from 1 to 20, so the bottom 0.15 of it is a range in
which three things disagree:

- the mark is drawn with the true amplitude, so at 1 it is three thin petals
  meeting at a single point
- the nesting is computed with the true amplitude, so at 1 the fit reads 0.000
  and every copy after the first shrinks to nothing
- the letters are bent as though the amplitude were 1.15

The letters at an amplitude of 1 are unreadable in any case. The word "oso"
renders as three blobs.

Nothing in the comparison forces a choice. The recorded fixture's lowest
amplitude is 1.2, above the floor, so either behaviour would pass parity. This
is a decision on the merits, which is why it is written down.

## Decision

The floor of 1.15 applies everywhere the curve is used: the drawn shape, the
fit search, the pen and the reshaping of glyphs. Below it the amplitude stops
having an effect, and the nesting reports a safety limit naming the value given
and the value used.

## Consequences

The mark and the letters are always made of the same curve. That is the whole
of the benefit, and it is worth more than it sounds: a designer who cannot trust
that the preview and the letters are the same shape cannot trust anything else
the tool says.

The bottom 0.15 of the slider becomes a dead zone. That is a real cost, and the
report is what keeps it from being a silent one: the studio can say the
amplitude floor is holding, which the prototype cannot.

What is lost is the cusped three-petal shape. It was only ever reachable
alongside collapsed nesting and unreadable text, so what is lost is a corner of
the parameter space nobody could ship from.

The floor stays a number in one place rather than three, so raising or lowering
it later is one edit.

## Alternatives considered

**Reproduce the prototype exactly.** Maximum fidelity, and it is milestone 03's
stated job to be faithful. Rejected because faithfulness is to the prototype's
behaviour where that behaviour is a decision, and this one is not: the floor is
in one place because of where it was needed, not because anyone chose that the
mark and the letters should differ. Copying it would mean the port ships a
range in which its own preview lies about its own output.

**Remove the floor entirely.** The most honest reading of a slider that says it
goes to 1: at 1 you get sharp petals in the mark and in the letters, and
everything agrees. Rejected because the floor is presumably there to stop
something degenerating, the nesting still collapses at 1, and the result is a
consistent view of a broken state rather than a working one. Making the bottom
of the range consistently useless is not an improvement on making it
inconsistently useless.

**Move the slider's minimum to 1.15.** No dead zone, no inconsistency, nothing
to report. Genuinely attractive, and the closest thing to a fourth option worth
revisiting. Rejected for now because the range is one of the things milestone 02
recorded about the prototype, and changing a control's declared range is a
larger departure than flooring a value inside it. If the dead zone proves
annoying in use, this is the change to make, and it is a one-line change to a
parameter declaration.
