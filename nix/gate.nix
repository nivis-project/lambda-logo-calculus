{ lib
, stdenv
, src
, nodejs_24
, pnpm
, fetchPnpmDeps
, pnpmConfigHook
}:

let
  node = nodejs_24;

  # The hash of the pnpm store for pnpm-lock.yaml. A change that touches
  # package.json or pnpm-lock.yaml must update it in the same OpenSpec change,
  # or the sandboxed gate cannot install. To update: set it to "", build, and
  # copy the hash the failure reports. Required by name in openspec change
  # add-nix-flake-and-gate, task 4.5.
  pnpmDepsHash = "sha256-1iij0IksZVaqflwnurHCc2lYeuKIM6lkq+Lwjidr9Gg=";
in
stdenv.mkDerivation (finalAttrs: {
  pname = "lambda-logo-calculus-gate";
  version = "0.0.0";

  inherit src;

  pnpmDeps = fetchPnpmDeps {
    inherit (finalAttrs) pname version src;
    inherit pnpm;
    fetcherVersion = 4;
    hash = pnpmDepsHash;
  };

  nativeBuildInputs = [
    node
    pnpm
    pnpmConfigHook
  ];

  dontConfigure = false;

  buildPhase = ''
    runHook preBuild
    bash scripts/gate.sh
    runHook postBuild
  '';

  doCheck = false;

  installPhase = ''
    runHook preInstall
    mkdir -p $out
    echo "gate passed" > $out/result
    runHook postInstall
  '';

  meta = {
    description = "The one gate: build, lint and test, offline";
    platforms = lib.platforms.unix;
  };
})
