# render-budget Specification

## Purpose
TBD - created by archiving change add-worker-and-budget. Update Purpose after archive.

## Requirements

### Requirement: Sampling quality is data

How finely the pen, the stroke endings, the joins and the nesting search sample
SHALL be a record with an id, carrying one number per thing sampled. A full and
a draft quality SHALL be registered. Nothing SHALL hard-code a sample count that
the quality record names.

#### Scenario: Two qualities

- **WHEN** the qualities are read
- **THEN** there is a full one and a draft one, and draft samples less finely in
  every place

#### Scenario: Quality reaches the pen

- **WHEN** a scene is built at draft quality
- **THEN** the pen's support table holds the draft number of entries

#### Scenario: Full quality is the default

- **WHEN** a scene is built with no quality given
- **THEN** it is built at full quality, and the result is what it was before
  quality existed

### Requirement: A glyph is cached by what its geometry depends on

A glyph's outlines SHALL be cached under a hash of the template and its
parameters, the rotation, the copy scales, the stroke width, the stage list, the
ending, the join, the per-glyph patch, the modulation values and the quality.

The hash SHALL NOT include the palette, the opacity or anything else that cannot
move a point, so changing a colour redraws from the cache.

The cache SHALL be passed in rather than held in a module, so a worker, the
studio and a benchmark each hold their own.

#### Scenario: A colour change hits the cache

- **WHEN** the same scene is rebuilt with a different opacity
- **THEN** every glyph comes from the cache and the geometry is identical

#### Scenario: A parameter change misses the cache

- **WHEN** a template parameter changes
- **THEN** the glyphs are rebuilt

#### Scenario: A cached render costs almost nothing

- **WHEN** a 20-character wordmark at 12 copies is rebuilt with only its opacity
  changed
- **THEN** it takes under a millisecond

#### Scenario: The pens wait for a miss

- **WHEN** every glyph of a render comes from the cache
- **THEN** no pen is built

### Requirement: The budget is measured and the gate holds it

A 20-character wordmark at 12 copies SHALL rebuild in under 16 ms at draft
quality, measured as the median of repeated builds with a parameter moving
between them, the way a drag moves it.

The benchmark SHALL run in the gate, alone rather than beside the rest of the
suite, because a wall-clock measurement taken while thirty other test files are
running measures the machine rather than the pipeline.

It SHALL fail when the budget is broken.

#### Scenario: The budget holds while dragging

- **WHEN** a 20-character wordmark at 12 copies is rebuilt repeatedly at draft
  quality with a parameter moving between builds
- **THEN** the median build is under 16 ms

#### Scenario: Full quality on release is not slow enough to feel

- **WHEN** the same wordmark is rebuilt once at full quality
- **THEN** it takes under 50 ms

#### Scenario: The benchmark can fail

- **WHEN** the budget is measured against a figure it cannot meet
- **THEN** the benchmark reports the measurement rather than passing quietly

#### Scenario: The benchmark runs alone

- **WHEN** the gate runs
- **THEN** the benchmark runs as its own step, not beside the other test files
