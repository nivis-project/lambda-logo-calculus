{
  description = "Trefoil Studio - a functional, parametric logo creator";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      supportedSystems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];

      forAllSystems = f:
        nixpkgs.lib.genAttrs supportedSystems
          (system: f {
            inherit system;
            pkgs = nixpkgs.legacyPackages.${system};
          });
    in
    {
      devShells = forAllSystems ({ pkgs, ... }: {
        default = pkgs.mkShell {
          name = "trefoil-studio";

          packages = with pkgs; [
            nodejs_24
            pnpm
            jujutsu
            git
          ] ++ pkgs.lib.optionals pkgs.stdenv.hostPlatform.isLinux [
            playwright-driver.browsers
          ];

          env = {
            PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = "1";
          } // pkgs.lib.optionalAttrs pkgs.stdenv.hostPlatform.isLinux {
            PLAYWRIGHT_BROWSERS_PATH = "${pkgs.playwright-driver.browsers}";
            PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS = "true";
          };

          shellHook = ''
            echo "trefoil-studio devshell: node $(node --version), pnpm $(pnpm --version)"
          '';
        };
      });

      formatter = forAllSystems ({ pkgs, ... }: pkgs.nixpkgs-fmt);

      checks = forAllSystems ({ system, ... }: {
        devshell-builds = self.devShells.${system}.default;
      });
    };
}
