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

### 3. AVX check bypass for Wine/Rosetta (1 file)
ARM64 Macs running x86_64 via Rosetta don't have AVX instructions. Bypasses the check when `WINEPREFIX` env var is set.
- `engine/Sandbox.AppSystem/AppSystem.cs`

## Prerequisites
- macOS with Apple Silicon (ARM64)
- .NET 10 SDK: `brew install dotnet-sdk`
- Wine CrossOver: `brew install gcenx/wine/wine-crossover`
- Windows .NET 10 runtime (zip) extracted to `~/.wine-sbox/drive_c/dotnet/`

## How to use

### Build (native macOS)
```bash
git clone https://github.com/Facepunch/sbox-public.git
cd sbox-public
# Apply patches, then:
dotnet run --project ./engine/Tools/SboxBuild/SboxBuild.csproj -- build --config Developer
```

### Run dedicated server (via Wine)
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
- **Editor GUI**: Blocked by Wine loader_section deadlock during .NET CLR startup. Needs Wine 9+ or native macOS engine2 binary from Facepunch.

## Patch file
`sbox-macos-crossplatform.patch` can be applied with:
```bash
cd sbox-public && git apply ../sbox-macos-crossplatform.patch
```
