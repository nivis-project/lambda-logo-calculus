## ADDED Requirements

### Requirement: A renderer rounds in the space the viewer sees

A renderer SHALL round a coordinate to a fixed precision in the root's
coordinate space, not in the local space of the group that holds it.

Where a group scales its children, the renderer SHALL keep enough decimals that
the rounding error, once that scale is applied, stays within the same bound as
it would for a path drawn at scale 1. A scene that draws a shape at unit size
and scales it up SHALL be as accurate as the same scene drawn at full size.

#### Scenario: A shape drawn small and scaled up

- **WHEN** a contour spanning about one unit sits in a group scaled by 400
- **THEN** its rendered coordinates carry enough decimals that the error after
  scaling is no larger than for the same contour drawn directly at that size

#### Scenario: A path at scale 1

- **WHEN** a path sits in groups that only translate, or mirror by -1
- **THEN** it is rounded exactly as before, so recorded output does not move
