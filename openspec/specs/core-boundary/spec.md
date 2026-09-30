# core-boundary Specification

## Purpose
The geometry core must stay a pure function library that runs anywhere: in a
browser, in Node, in a worker, in a test with no DOM. This capability defines
what that purity means in concrete terms and how a violation is caught before it
reaches the main branch.

## Requirements

### Requirement: The core imports no user interface or rendering code

`packages/core` SHALL NOT import, directly or transitively, any UI framework,
any DOM global, or any renderer or exporter package. Forbidden imports include
`react`, `react-dom`, any package under `packages/render-*`,
`packages/export`, and the globals `document`, `window`, `navigator`,
`localStorage` and `HTMLElement`.

`packages/core` MAY import its own modules, `packages/templates`, and
dependencies that are themselves free of UI and DOM.

#### Scenario: A forbidden framework import is added to the core

- **WHEN** a module under `packages/core` imports `react`
- **THEN** the lint run fails, naming the file, the import and the rule
- **AND** the build gate fails, so the change cannot be archived or committed

#### Scenario: A forbidden DOM global is used in the core

- **WHEN** a module under `packages/core` references `document` or `window`
- **THEN** the lint run fails, naming the file and the global

#### Scenario: The core is imported where no DOM exists

- **WHEN** the built core bundle is imported by a Node process with no DOM and
  no browser globals defined
- **THEN** it loads and its exported functions run without throwing

### Requirement: The boundary is verified against the built output

The purity of the core SHALL be verified against the built bundle, not only
against the source. A lint rule that has been disabled, a config that has been
edited, or an import introduced through a dependency MUST still be caught.

#### Scenario: A forbidden import reaches the built bundle

- **WHEN** the built core bundle contains a reference to a forbidden import or
  global, by any route
- **THEN** the boundary test fails and names what it found

#### Scenario: The bundle is clean

- **WHEN** the built core bundle contains no forbidden import or global
- **THEN** the boundary test passes

### Requirement: Core functions are deterministic

Given the same parameters, a core function SHALL return the same result. The
core SHALL NOT call `Math.random()`, read the system clock, or read any global
mutable state. Randomness SHALL come from a seed passed in by the caller.

#### Scenario: The same parameters are evaluated twice

- **WHEN** a core function is called twice with parameters that compare equal
- **THEN** both calls return results that compare equal

#### Scenario: A non-deterministic source is used in the core

- **WHEN** a module under `packages/core` calls `Math.random()` or `Date.now()`
- **THEN** the lint run fails, naming the file and the call

### Requirement: Every package compiles under strict TypeScript

Every package in the workspace SHALL compile with TypeScript `strict` mode and
`noUncheckedIndexedAccess` enabled. A package MUST NOT weaken these settings in
its own config.

#### Scenario: An indexed access is used without a presence check

- **WHEN** a module reads `items[i]` and uses the result as if it were defined
- **THEN** the type check fails, because `noUncheckedIndexedAccess` types it as
  possibly undefined

#### Scenario: A package tries to relax the shared settings

- **WHEN** a package config sets `strict` to false or disables
  `noUncheckedIndexedAccess`
- **THEN** the build gate fails
