# 0007. Scope of the first release

- Status: accepted
- Date: 2026-10-01
- Change: `openspec/changes/archive/2026-10-01-add-repository-documents`

## Context

`docs/briefing.md` closes with five open questions and says they must be settled
before or during the first milestone. Four of them decide what the first release
contains; the fifth, the UI framework, is ADR 0003.

The questions were put to the user before any code was written, and answered.
This record keeps the answers and the reasoning attached to each, so a later
contributor does not reopen a settled scope question by accident.

The risk this guards against is specific. Every one of these four is easy to say
yes to and expensive to deliver, and each would pull work away from the thing
the first release is actually for: a clean, extensible foundation.

## Decision

**Logos only. No font file export.** The outputs are SVG, PNG at 1x, 2x and 4x,
PDF, a brand sheet, and a project file that reopens exactly as saved.

**Web only. No desktop build.** A Vite application, autosave to browser storage,
project files through download and upload.

**A brand sheet is in scope.** Mark, both lockups, the colours and the clear
space, on one page.

**Apache-2.0, public from the start.** The licence already in the repository.

## Consequences

Dropping font export keeps the glyph model honest about what it is. Skeletons on
a shared grid are a good representation for generated letterforms and a poor one
for a font: glyph naming, kerning tables, hinting, OS/2 metrics and Unicode
coverage are a separate problem with its own vocabulary. The exporter registry
means adding opentype.js later is one more registration, not a rework, but the
skeleton model would still need to learn all of that first.

Staying web-only keeps a Rust toolchain and a second build target out of the
flake. Because nothing touches the filesystem directly, Tauri remains available
later; that is a constraint this decision imposes on every file-handling
decision from here on.

The brand sheet is the one answer that adds work rather than removing it. It
brings a multi-artboard composition layer and clear-space computation, both of
which are real. It earns its place because it is what a designer hands to a
client, and because it forces the lockup registry to be genuinely reusable
rather than a special case for the preview. A mark that cannot be placed on a
sheet next to its own lockups is not finished.

Apache-2.0 from the start means no relicensing conversation later, when there
are contributors to ask. The patent grant matters more than usual here: the
product is a body of geometric methods.

## Alternatives considered

**Include font file export.** The alphabet is already there, and opentype.js
would produce an OTF from the outlines. Rejected: the skeleton model carries no
font metadata, and the feature is an invitation to judge the output as a
typeface rather than as a logo system. Deferred, not abandoned.

**Ship a Tauri desktop build alongside the web app.** Real file dialogs, offline
use, no browser storage limits. Rejected: a Rust toolchain in the flake and a
second target in the gate, in exchange for convenience the first release does
not need. The web app is written so this stays possible.

**Leave the brand sheet out of the first release.** It is the largest of the
four in implementation cost, and the pipeline would be finished sooner without
it. Rejected by the user. The composition layer it requires is also what a
future multi-artboard export would need, so the cost is not wasted.

**Keep the repository private during the proof of concept.** No pressure to
polish, and no audience for an unfinished tool. Rejected: the licence is already
in the tree, and deciding to open a repository later is a conversation with
whoever has contributed by then.

**MIT instead of Apache-2.0.** Shorter and more permissive. Rejected: no patent
grant, which for a project built on geometric methods is the clause worth
having.
