# s&box for macOS (Apple Silicon)

Run [Facepunch s&box](https://sbox.game) on macOS ARM64 via a Wine compatibility layer.

## Install

```bash
git clone https://github.com/samcarrara415/Sams-repo.git
cd Sams-repo/sbox-macos-patches
./install.sh
```

That's it. The installer will:
1. Check and install prerequisites (Homebrew, .NET SDK, Wine CrossOver)
2. Clone `sbox-public` from Facepunch
3. Apply all macOS patches
4. Build the engine
5. Set up a Wine prefix with the Windows .NET 10 runtime

## Run

```bash
./sbox-wine-launcher.sh              # game client
./sbox-wine-launcher.sh --server     # dedicated server
./sbox-wine-launcher.sh --editor     # editor (experimental)
```

Or use `make`:

```bash
make run        # game client
make server     # dedicated server
make editor     # editor (experimental)
make test       # unit tests (native macOS)
```

## Prerequisites

Installed automatically by `./install.sh`, or install manually:

| Tool | Install | Purpose |
|------|---------|---------|
| Homebrew | [brew.sh](https://brew.sh) | Package manager |
| .NET 10 SDK | `brew install dotnet-sdk` | Build the engine |
| Wine CrossOver | `brew install gcenx/wine/wine-crossover` | Run Windows binaries |
| MoltenVK | `brew install molten-vk` | Vulkan on macOS (optional) |

## What the patches do

| # | Patch | Files |
|---|-------|-------|
| 1 | Cross-platform path separators (`\` → `Path.Combine()`) | 3 test files |
| 2 | Platform-aware native library loading (`.dll` / `.dylib` / `.so`) | 6 interop files |
| 3 | Wine environment detection (`IsRunningUnderWine`, `IsWineOnMacOS`) | AppSystem.cs |
| 4 | AVX instruction check bypass under Wine/Rosetta | AppSystem.cs |
| 5 | macOS folder access (`~/Library/Application Support/sbox/`) | AppSystem.cs |
| 6 | Cross-platform Steam library loading | AppSystem.cs |
| 7 | Platform-aware `.dll`→`.exe` command line rewrite | AppSystem.cs |

## Wine compatibility layer

The launcher script (`sbox-wine-launcher.sh`) configures Wine with these CLR deadlock mitigations:

- **esync / fsync** — Reduces lock contention during CLR startup
- **Mono disabled** — Uses real .NET runtime instead of Wine Mono
- **CLR diagnostics disabled** — Avoids diagnostic pipe hang under Wine
- **Tiered compilation disabled** — Prevents JIT threading issues at startup
- **Thread pool tuning** — Forces minimum worker threads for editor mode
- **MoltenVK configured** — Vulkan-on-Metal for macOS rendering

## Status

| Component | Status |
|-----------|--------|
| Managed build | 0 errors, 0 warnings |
| Unit tests | 229/240 pass (native macOS) |
| Dedicated server | Working (Wine) |
| Game client | Working (Wine) |
| Editor GUI | Experimental (may hang on Wine < 9) |

## Troubleshooting

### Editor hangs at startup

The .NET CLR can deadlock with Wine's `loader_section` lock. Try:

```bash
WINEESYNC=0 WINEFSYNC=0 ./sbox-wine-launcher.sh --editor
```

If that doesn't help, you need Wine 9+ (`brew upgrade wine-crossover`).

### Vulkan / rendering issues

Install MoltenVK for Vulkan support on macOS:

```bash
brew install molten-vk
```

### Build fails after source update

Re-apply patches after pulling new source:

```bash
cd sbox-public
git checkout -- .
cd ..
./install.sh
```

### Custom paths

```bash
SBOX_DIR=/path/to/sbox-public WINEPREFIX=~/.my-wine ./install.sh
```

## Uninstall

```bash
make uninstall
```

Removes the `sbox-public` checkout and Wine prefix.

## File structure

```
sbox-macos-patches/
├── install.sh                   # one-command installer
├── Makefile                     # make build / run / test / etc.
├── sbox-wine-setup.sh           # Wine prefix setup
├── sbox-wine-launcher.sh        # Wine launch wrapper
├── sbox-macos-crossplatform.patch  # git-apply patch
├── engine/                      # patched source files
│   ├── Sandbox.AppSystem/
│   ├── Sandbox.Engine/
│   ├── Sandbox.Tools/
│   └── Sandbox.Compiling.Test/
└── README.md
```
