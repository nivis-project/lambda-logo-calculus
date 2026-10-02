#!/usr/bin/env bash
# ship-change.sh <change-name> [commit-subject] [bean-id]
#
# Gated tail for shipping ONE implemented OpenSpec change:
#   validate -> stage -> gate (nix flake check) -> archive -> close bean
#   -> commit -> push.
# If the gate fails this aborts before archiving or committing.
set -euo pipefail

CHANGE="${1:?usage: ship-change.sh <change-name> [commit-subject] [bean-id]}"
SUBJECT="${2:-Implement ${CHANGE}}"
BEAN="${3:-}"
BRANCH="trefoil-v2"

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

TASKS="openspec/changes/${CHANGE}/tasks.md"
if [[ ! -d "openspec/changes/${CHANGE}" ]]; then
  echo "ship: no active change ${CHANGE} under openspec/changes/" >&2
  exit 1
fi
if [[ -f "$TASKS" ]] && grep -qE "^\s*- \[ \]" "$TASKS"; then
  echo "ship: $TASKS still has unchecked tasks, finish the apply step first" >&2
  exit 1
fi
if [[ -n "$BEAN" ]] && ! beans show "$BEAN" >/dev/null 2>&1; then
  echo "ship: no bean ${BEAN}" >&2
  exit 1
fi

echo "==> [1/6] validate the OpenSpec change"
openspec validate "${CHANGE}" --type change --strict

echo "==> [2/6] stage working tree (so nix flake sees new files)"
git add -A

echo "==> [3/6] gate: nix flake check, then the browser suite"
nix flake check
# Chromium cannot run in the Nix sandbox, so the browser suite runs in the dev
# shell. The script may be called from outside it.
if command -v pnpm >/dev/null 2>&1; then pnpm e2e; else nix develop -c pnpm e2e; fi

echo "==> [4/6] archive OpenSpec change: ${CHANGE}"
openspec archive "${CHANGE}" --yes

if [[ -n "$BEAN" ]]; then
  echo "==> [5/6] close bean: ${BEAN}"
  beans update "$BEAN" -s completed >/dev/null
else
  echo "==> [5/6] no bean given, skipping"
fi

echo "==> [6/6] commit and push ${BRANCH}"
git add -A
jj commit -m "${SUBJECT}"
jj bookmark set "${BRANCH}" -r @-
jj git push --bookmark "${BRANCH}"

echo "==> shipped ${CHANGE}"
