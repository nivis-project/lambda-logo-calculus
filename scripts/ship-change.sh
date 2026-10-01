#!/usr/bin/env bash
# ship-change.sh <change-name> [commit-subject] [bean-id]
#
# Gated tail for shipping ONE implemented OpenSpec change:
#   stage -> gate (nix flake check) -> archive -> close bean -> commit -> push.
# If the gate fails this aborts before archiving, closing or committing.
set -euo pipefail

CHANGE="${1:?usage: ship-change.sh <change-name> [commit-subject] [bean-id]}"
SUBJECT="${2:-Implement ${CHANGE}}"
BEAN="${3:-}"

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

echo "==> [1/7] validate the OpenSpec change"
openspec validate "${CHANGE}" --type change --strict

echo "==> [2/7] stage working tree (so nix flake sees new files)"
git add -A

echo "==> [3/7] gate: nix flake check, then the browser suite"
nix flake check
nix develop -c pnpm e2e

echo "==> [4/7] archive OpenSpec change: ${CHANGE}"
openspec archive "${CHANGE}" --yes

if [[ -n "$BEAN" ]]; then
  echo "==> [5/7] close bean: ${BEAN}"
  beans update "$BEAN" -s completed >/dev/null
else
  echo "==> [5/7] no bean given, skipping"
fi

echo "==> [6/7] commit"
git add -A
jj commit -m "${SUBJECT}"

echo "==> [7/7] push main"
jj bookmark set main -r @-
jj git push --bookmark main

echo "==> shipped ${CHANGE}"
