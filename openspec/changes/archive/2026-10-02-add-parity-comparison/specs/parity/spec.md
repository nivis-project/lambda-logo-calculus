## ADDED Requirements

### Requirement: The port is compared against every recorded setting

The comparison SHALL run the port at each recorded setting and compare what it
draws against what the prototype drew, within the derived tolerance.

Every glyph of every pass of every recording SHALL be compared. A comparison
that covers a subset SHALL report which settings it skipped and why.

#### Scenario: Every setting

- **WHEN** the comparison runs
- **THEN** it covers every recording in the fixture

#### Scenario: Within the tolerance

- **WHEN** the port is compared against the prototype
- **THEN** every compared point is within the tolerance

#### Scenario: The margin is reported

- **WHEN** the comparison passes
- **THEN** it reports the worst difference it measured, so the margin is known

### Requirement: The comparison can fail

A test SHALL prove the comparison is capable of failing, by moving a coordinate
by more than the tolerance and confirming it is caught.

A comparison nobody has seen fail is a comparison nobody should believe.

#### Scenario: A nudged coordinate

- **WHEN** one coordinate of a recording is moved by one font unit
- **THEN** the comparison fails and names the setting and the glyph

### Requirement: What is compared, and what is not

The comparison SHALL cover the geometry the prototype writes as path
coordinates: stroke outlines, bowl rings and join loops.

It SHALL NOT cover the shapes the prototype writes as references to a
definition with a transform, because resolving those would mean reimplementing
the prototype's own drawing, which is what the recording exists to avoid. What
is left out SHALL be stated rather than left for a reader to notice.

#### Scenario: What is covered

- **WHEN** the comparison runs
- **THEN** it compares stroke outlines, bowl rings and join loops

#### Scenario: What is not

- **WHEN** the comparison runs
- **THEN** it states that shapes written as references are not compared, and why

### Requirement: Parity is a one-time gate

Once this comparison has passed and been archived, golden snapshots SHALL become
the baseline, and the prototype SHALL stop being authoritative for anything
except reading.

The parity suite SHALL stay in the repository as the record of the port.

#### Scenario: After the port

- **WHEN** a later change moves the geometry
- **THEN** it is the golden snapshots that notice, not the parity comparison
