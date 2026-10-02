{
  description = "lambda-logo-calculus: a functional, parametric logo creator";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/c59305bab2065cfecc4944690d9eedbb56f3a9fa";

  outputs = { self, nixpkgs }:
    let
      supportedSystems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];

      forAllSystems = f:
        nixpkgs.lib.genAttrs supportedSystems (system: f nixpkgs.legacyPackages.${system});
    in
    {
      devShells = forAllSystems (pkgs: {
        default = pkgs.mkShell {
          name = "lambda-logo-calculus";

          packages = [
            pkgs.nodejs_24
            pkgs.pnpm
            pkgs.jujutsu
            pkgs.git
          ];

          env = {
            PLAYWRIGHT_BROWSERS_PATH = "${pkgs.playwright-driver.browsers}";
            PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS = "true";
            PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = "1";
          };

          shellHook = ''
            echo "lambda-logo-calculus: node $(node --version), pnpm $(pnpm --version), jj $(jj --version | cut -d' ' -f2)"
          '';
        };
      });

      checks = forAllSystems (pkgs: {
        gate = pkgs.callPackage ./nix/gate.nix { src = self; };
      });

      formatter = forAllSystems (pkgs: pkgs.nixpkgs-fmt);
    };
}
