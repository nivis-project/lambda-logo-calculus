{ pkgs, src }:

let
  inherit (pkgs) lib stdenv;
  pnpm = pkgs.pnpm_12;
  nodejs = pkgs.nodejs_24;

  # This hash covers the whole resolved dependency tree. Any change to
  # package.json or pnpm-lock.yaml must update it in the same OpenSpec change,
  # or the gate fails with the value to paste here.
  pnpmDepsHash = "sha256-+HlTL0M9Y/OHClLYFwd3bV3FZYm9+k/1YaWdIIZgWHc=";
in
stdenv.mkDerivation (finalAttrs: {
  pname = "trefoil-studio-gate";
  version = "0.0.0";

  inherit src;

  pnpmDeps = pkgs.fetchPnpmDeps {
    inherit (finalAttrs) pname version src;
    inherit pnpm;
    fetcherVersion = 4;
    hash = pnpmDepsHash;
  };

  nativeBuildInputs = [
    nodejs
    pnpm
    pkgs.pnpmConfigHook
  ];

  env = {
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = "1";
  } // lib.optionalAttrs stdenv.hostPlatform.isLinux {
    PLAYWRIGHT_BROWSERS_PATH = "${pkgs.playwright-driver.browsers}";
    PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS = "true";
  };

  buildPhase = ''
    runHook preBuild

    echo "==> build"
    pnpm build

    echo "==> lint"
    pnpm lint

    echo "==> unit, property and boundary tests with coverage"
    pnpm test:cov

    runHook postBuild
  '';

  doCheck = true;

  checkPhase = ''
    runHook preCheck

    echo "==> end to end"
    export HOME=$TMPDIR
    pnpm e2e

    runHook postCheck
  '';

  installPhase = ''
    runHook preInstall
    mkdir -p $out
    cp -r coverage $out/coverage 2>/dev/null || true
    echo "gate passed" > $out/result
    runHook postInstall
  '';

  dontFixup = true;
})
