# Testing strategy

The core is tested like a mathematics library and the studio like a design tool.
This document says which kind of test to reach for, and what each one proves
that the others cannot.

It is written before the port, deliberately. Deciding what counts as tested
while you are in the middle of porting a function is deciding it under pressure,
and the answer is always "the test I have already written".

## The kinds

### Known values

The mathematics has answers that can be written down before anything runs. The
perfect fit of a three-fold curve at a third of a turn is 1, because the curve
is unchanged by that rotation. That is not an observation about the code; it is
a fact about the curve, and the code either agrees with it or is wrong.

A known-value test fails loudly when a refactor quietly changes a number. It is
the cheapest test in the project and the one most likely to be skipped, because
the value feels obvious at the moment you know it.

Write one wherever the answer can be derived rather than measured. Put it next
to the function it pins.

### Property tests

An invariant holds for every parameter set, not only the ones someone thought
of. A stroke that starts on the baseline ends on the baseline. A nested copy
never crosses its parent. An exported path closes and contains no `NaN`.

These are written with a generator, so a failure comes back with a shrunk
counterexample: the smallest input that breaks it. That counterexample is
usually worth more than the test.

A property test that fails is never fixed by narrowing its generator. Either the
invariant is wrong, and the test changes with a written explanation, or the code
is wrong.

### Golden snapshots

A whole rendered output, recorded and compared. They catch what nobody thought
to assert: a glyph that moved three units, a contour that gained a point, a
colour that shifted.

A snapshot changing is not a failure by itself. It is a question: was this
intended? Answer it by looking at the picture, not the diff. The diff of a path
is unreadable and the picture is not.

Never regenerate a snapshot to make a red gate green. That is how a regression
becomes the new baseline.

### Parity against the prototype

Milestone 03 carries an obligation the others do not: the port must reproduce
`reference/trefoil-type.html` within a stated tolerance.

The comparison is against a recording of the prototype's own output, produced by
driving the prototype itself. Nothing of it is reimplemented to make the
recording, because a reimplementation would prove only that two transcriptions
agree.

The tolerance is derived, not chosen, and here is the derivation.

The prototype rounds every coordinate it writes to two decimal places. A
coordinate can therefore be out by up to 0.005 in each axis however correct both
sides are, which as a distance is `sqrt(2) * 0.005`, about **0.00707 font
units**. No comparison against the prototype's output can be tighter than that.

The tolerance is **0.02 font units**: roughly three times the floor, and tight
enough to catch an error of one five-hundredth of a stroke width. The numbers
live in `test/parity/index.json` and a test checks the arithmetic, so the
tolerance cannot drift away from the rounding it came from.

The recording itself has three guards. It stores what each control actually took
as well as what it was asked for, and a test fails when they differ, so a
snapped slider is never compared against an unsnapped expectation. It fixes and
records the container width, because the prototype's geometry depends on it. And
a test asserts the breadth of the matrix, so the fixture cannot quietly shrink
to the one case that happens to pass.

**The port and the prototype agree exactly.** The measured worst difference
across the whole matrix is **0.007050 font units**, over 215,352 compared points
in 27 settings. That is just under the 0.0070711 floor the prototype's own
rounding puts there, which means the two implementations do not differ at all:
what is left is the rounding. The figure is pinned by a test, so a change that
quietly moves the geometry has to say so.

What is compared is the geometry the prototype writes as path coordinates:
stroke outlines, bowl rings and join loops. What is not compared is the shapes
it writes as a reference to a definition with a transform, which is how it draws
an ending and a stamp. Resolving those would mean reimplementing its drawing,
and reimplementing the prototype is the thing the recording exists to avoid.

Parity is a one-time gate. Now that milestone 03 is archived, the golden
snapshots take over as the baseline and the prototype stops being authoritative
for anything except reading.

### End-to-end

Against the real thing, in a browser. These prove what unit tests cannot: that a
parameter definition actually produced a control, that undo actually restores,
that an export actually matches the screen.

They are slow and they are worth it, for the small number of claims that are
about the whole system rather than a part of it.

## Coverage

The gate enforces:

- 70 percent across the project
- 80 percent on `packages/core/src/**`

on statements, branches, functions and lines. Branches matter most: a line that
ran once down one of its two paths is not a line that has been tested, and line
coverage alone will happily say it was.

The core floor is higher because the core is pure. There is no setup to stand in
the way, no IO to mock, no environment to arrange. An untested branch in a
function that takes values and returns values is an untested branch nobody had a
reason to leave.

**What coverage is evidence of.** That nobody forgot. It finds the function
that was ported and never called, the error path nobody tried, the branch added
during a refactor and never reached.

**What it is not evidence of.** That anything was tested well. A test that calls
every function and asserts nothing scores 100 percent. A change that raises
coverage while removing assertions is a worse change, and the number will
applaud it.

So it is a floor, not a target. A file at 100 percent with no property test is
less tested than a file at 80 percent with one. Nobody should write a test whose
purpose is the percentage; if that is the only reason it exists, the honest move
is to delete the code it covers.

## Running them

```sh
nix develop -c pnpm test          # the suite
nix develop -c pnpm test:cov      # with the coverage thresholds
nix flake check                   # everything, as the gate runs it
```
