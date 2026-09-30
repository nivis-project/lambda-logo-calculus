## 1. Flake skeleton

- [x] 1.1 Write `flake.nix` with a `nixpkgs` input pinned to `nixos-unstable`
  and a `supportedSystems` list of `x86_64-linux`, `aarch64-linux`,
  `x86_64-darwin` and `aarch64-darwin`. Verify `nix flake show` lists an output
  for each of the four.
- [x] 1.2 Build the per-system outputs with a `forAllSystems` helper over
  `nixpkgs.lib.genAttrs`. Verify `grep -c flake-utils flake.nix` reports 0 and
  that `flake.nix` has no second input.

## 2. Dev shell

- [x] 2.1 Add the default dev shell with `nodejs_24`, `pnpm`, `jujutsu` and
  `git`. Verify `nix develop -c node --version` prints a version starting `v24.`
  and `nix develop -c pnpm --version` prints a version.
- [x] 2.2 Add `playwright-driver.browsers` on Linux only, with
  `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD`, `PLAYWRIGHT_BROWSERS_PATH` and
  `PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS` set. Verify
  `nix develop -c sh -c 'ls $PLAYWRIGHT_BROWSERS_PATH'` lists browser
  directories on this Linux machine.
- [x] 2.3 Add a `shellHook` that prints the resolved node and pnpm versions.
  Verify entering the shell prints it.

## 3. Formatter and checks

- [x] 3.1 Set `formatter` to `nixpkgs-fmt` for every supported system. Verify
  `nix fmt -- --check flake.nix` reports the file is already formatted.
- [x] 3.2 Add a `checks` attribute with a `devshell-builds` entry pointing at
  the default dev shell. Verify `nix flake check` succeeds.

## 4. Lock and verification

- [x] 4.1 Generate `flake.lock` and commit it. Verify it exists and names
  `nixos-unstable` as the `nixpkgs` ref.
- [x] 4.2 Verify `nix flake check` is green from a clean checkout state, with
  the tree staged so `nix` can see the new files.
