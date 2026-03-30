# s&box macOS Build Patches

Patches to build and run Facepunch s&box engine on macOS ARM64 (Apple Silicon).

## What these patches do

### 1. Cross-platform path fixes (3 files)
Windows-style path separators (`\`) replaced with `Path.Combine()` for macOS/Linux compatibility.
- `engine/Sandbox.Compiling.Test/Tests/CodeGen.cs`
- `engine/Sandbox.Compiling.Test/Tests/BlacklistTest.cs`
- `engine/Sandbox.Compiling.Test/Tests/Razor.cs`

### 2. Platform-aware native library loading (6 files)
Generated interop files had hardcoded `.dylib` extensions. Changed to runtime platform detection:
```csharp
string libName = OperatingSystem.IsWindows() ? "name.dll"
    : OperatingSystem.IsMacOS() ? "libname.dylib"
    : "libname.so";
```
- `engine/Sandbox.Engine/Interop.Engine.cs` (engine2)
- `engine/Sandbox.Tools/Interop.Tools.cs` (toolframework2)
- `engine/Sandbox.Tools/Interop.Animgraph.cs` (animgraph_editor)
- `engine/Sandbox.Tools/Interop.AssetSystem.cs` (assetsystem)
- `engine/Sandbox.Tools/Interop.ModelDoc.cs` (modeldoc_editor)
- `engine/Sandbox.Tools/Interop.Hammer.cs` (hammer)

### 3. Wine environment detection (1 file)
Static `IsRunningUnderWine` and `IsWineOnMacOS` properties on `AppSystem` detect the Wine compatibility layer at startup. Under Wine `OperatingSystem.IsWindows()` returns true, so these properties let the engine know the real host OS for data paths, Vulkan config, and diagnostics.
- `engine/Sandbox.AppSystem/AppSystem.cs`

### 4. AVX check bypass for Wine/Rosetta (1 file)
ARM64 Macs running x86_64 via Rosetta don't have AVX instructions. Bypasses the check when running under Wine.
- `engine/Sandbox.AppSystem/AppSystem.cs`

### 5. macOS folder access and platform directories (1 file)
On macOS (and Linux) the install directory may be read-only. `EnsurePlatformDirectories()` creates writable storage:
- **macOS (native)**: `~/Library/Application Support/sbox/{config,data,cache,addons,logs}`
- **macOS (via Wine)**: Same path, resolved from `WINEPREFIX` or `SBOX_DATA_DIR` env var
- **Linux**: `$XDG_DATA_HOME/sbox/` (defaults to `~/.local/share/sbox/`)
- Sets `SBOX_DATA_DIR` environment variable for native engine discovery.
- `engine/Sandbox.AppSystem/AppSystem.cs`

### 6. Cross-platform Steam library loading (1 file)
`LoadSteamDll()` was Windows-only with hardcoded backslash paths. Now loads the correct library per platform:
- **Windows**: `bin/win64/steam_api64.dll`
- **macOS**: `bin/osx64/libsteam_api.dylib` (falls back to Wine layout)
- **Linux**: `bin/linux64/libsteam_api.so`
- `engine/Sandbox.AppSystem/AppSystem.cs`

### 7. Platform-aware command line handling (1 file)
The `.dll` → `.exe` entry point name rewrite in `InitGame()` is now Windows-only. On macOS/Linux the `.dll` name is passed through unchanged.
- `engine/Sandbox.AppSystem/AppSystem.cs`

## Prerequisites
- macOS with Apple Silicon (ARM64)
- .NET 10 SDK: `brew install dotnet-sdk`
- Wine CrossOver: `brew install gcenx/wine/wine-crossover`
- Windows .NET 10 runtime (zip) extracted to `~/.wine-sbox/drive_c/dotnet/`

## Quick start (Wine compatibility layer)

### One-time setup
```bash
./sbox-wine-setup.sh
```
This installs Wine (if needed), creates the Wine prefix, downloads the Windows .NET runtime, and configures DLL overrides.

### Run via Wine
```bash
./sbox-wine-launcher.sh                  # game client
./sbox-wine-launcher.sh --server         # dedicated server
./sbox-wine-launcher.sh --editor         # editor (experimental)
./sbox-wine-launcher.sh --test           # unit tests
```

The launcher script handles all Wine environment configuration including:
- `WINEPREFIX`, `WINEARCH`, `WINEDEBUG` setup
- CLR deadlock mitigations (`WINEESYNC`, `WINEFSYNC`, thread pool tuning)
- Mono disabled in favor of real .NET runtime
- MoltenVK / Vulkan configuration for macOS
- `SBOX_WINE_COMPAT=1` flag for engine-side Wine-on-macOS detection

### Build (native macOS)
```bash
git clone https://github.com/Facepunch/sbox-public.git
cd sbox-public
# Apply patches, then:
dotnet run --project ./engine/Tools/SboxBuild/SboxBuild.csproj -- build --config Developer
```

### Run dedicated server (via Wine, manual)
```bash
WINEPREFIX=~/.wine-sbox WINEDEBUG=-all wine64 C:\\dotnet\\dotnet.exe exec C:\\sbox\\sbox-server.dll
```

### Run tests (native macOS)
```bash
dotnet test engine/Sandbox.Compiling.Test/bin/Release/net10.0/Sandbox.Compiling.Test.dll
dotnet test engine/Sandbox.Hotload.Test/bin/Release/net10.0/Sandbox.Hotload.Test.dll
```

## Status
- **Managed build**: Fully working (0 errors, 0 warnings)
- **Unit tests**: 229/240 pass natively on macOS
- **Dedicated server**: Running via Wine
- **Game client**: Running via Wine compatibility layer
- **Editor GUI**: Experimental via Wine — may deadlock on CLR startup with older Wine versions. Try `WINEESYNC=0 WINEFSYNC=0` if it hangs. Fully stable with Wine 9+ or native macOS engine2 binary from Facepunch.

## Troubleshooting

### Editor hangs at startup
The .NET CLR can deadlock with Wine's `loader_section` lock. Try:
```bash
WINEESYNC=0 WINEFSYNC=0 ./sbox-wine-launcher.sh --editor
```
If that still hangs, you need Wine 9+ or a native macOS engine2 binary from Facepunch.

### Vulkan / rendering issues
macOS requires MoltenVK for Vulkan support. The launcher sets `MVK_CONFIG_FULL_IMAGE_VIEW_SWIZZLE=1` automatically. If you see rendering artifacts, ensure MoltenVK is installed:
```bash
brew install molten-vk
```

### Steam library not found
Ensure `steam_api64.dll` is in `sbox-public/bin/win64/` (Windows layout for Wine), or `libsteam_api.dylib` in `bin/osx64/` (native macOS).

## Patch file
`sbox-macos-crossplatform.patch` can be applied with:
```bash
cd sbox-public && git apply ../sbox-macos-crossplatform.patch
```
