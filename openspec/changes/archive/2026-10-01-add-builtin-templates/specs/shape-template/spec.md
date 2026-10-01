## ADDED Requirements

### Requirement: Five templates ship built in

The built-in template set SHALL contain `trefoil`, `rose`, `superellipse`,
`supershape` and `rounded-polygon`. Each SHALL declare its own parameter
definitions and its own safety metadata, rather than sharing another template's.

#### Scenario: The set is listed

- **WHEN** the built-in shape templates are registered
- **THEN** all five are present, each with at least one parameter and its own
  safety limits

#### Scenario: Every template samples cleanly

- **WHEN** each template is sampled at its default parameters
- **THEN** every point is finite and no radius exceeds 1 after normalisation

### Requirement: The rose generalises the trefoil

The rose SHALL compute `r = A + cos(k theta)` with `k` from 2 to 12. At `k` of 3
it SHALL produce the same curve as the trefoil for the same amplitude.

The trefoil SHALL remain a separate registration, because a project file stores
a template id and that id must keep meaning what it meant.

#### Scenario: The rose at three lobes

- **WHEN** the rose is evaluated with `k` of 3 and the trefoil with the same
  amplitude
- **THEN** their radii agree at every angle

#### Scenario: The rose at other lobe counts

- **WHEN** the rose is evaluated with `k` of 5
- **THEN** its curve repeats five times in a full turn

### Requirement: A template's declared symmetry matches its curve

A template that declares a symmetry SHALL produce a curve that maps onto itself
when rotated by a full turn divided by that symmetry.

Symmetry MAY be a fixed number or a function of the template's parameters, for
templates whose symmetry is itself a parameter such as the rose's lobe count or
the polygon's side count. A template SHALL NOT declare both forms.

#### Scenario: A declared symmetry holds

- **WHEN** a template declaring symmetry `s` is evaluated at any angle and at
  that angle plus a full turn over `s`
- **THEN** the two radii agree to within tolerance

#### Scenario: A template declares no symmetry

- **WHEN** a template declares no symmetry
- **THEN** no symmetry is asserted of it

#### Scenario: Symmetry depends on a parameter

- **WHEN** the rose's lobe count is changed
- **THEN** its reported symmetry changes with it

#### Scenario: A template declares both forms

- **WHEN** a template declares both a fixed symmetry and a symmetry function
- **THEN** the registration is rejected, naming the template

### Requirement: Templates without a closed-form maximum radius are sampled

A template MAY declare `maxRadius` in closed form. A template that does not
SHALL have its maximum radius found by sampling, and normalisation SHALL work
either way.

#### Scenario: A template declares its maximum radius

- **WHEN** the rose, which knows its maximum is `A + 1`, is normalised
- **THEN** the declared value is used

#### Scenario: A template does not declare one

- **WHEN** the supershape, which has no simple closed form, is normalised
- **THEN** its maximum is found by sampling and the result still fills the unit
  disc

### Requirement: Each template declares safety limits suited to its own shape

Safety metadata SHALL be declared per template. A template whose parameters can
drive it towards a degenerate curve SHALL declare the limit that prevents it.

#### Scenario: The superellipse at a low exponent

- **WHEN** the superellipse's exponent is driven towards its declared minimum
- **THEN** the computation applies the limit and reports a warning naming it

#### Scenario: A template within its limits

- **WHEN** any template is evaluated at its default parameters
- **THEN** no safety warning is produced
