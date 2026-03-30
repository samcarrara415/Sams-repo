#!/usr/bin/env bash
# -----------------------------------------------------------------
#  sbox-wine-setup.sh  --  One-time Wine prefix setup for s&box on macOS
#
#  This script:
#    1. Installs Wine CrossOver via Homebrew (if missing)
#    2. Creates a 64-bit Wine prefix
#    3. Downloads and extracts the Windows .NET 10 runtime
#    4. Symlinks the s&box build into the prefix
#    5. Configures DLL overrides and registry tweaks
#
#  Usage:
#    ./sbox-wine-setup.sh                              # defaults
#    SBOX_DIR=/path/to/sbox-public ./sbox-wine-setup.sh  # custom path
# -----------------------------------------------------------------
set -euo pipefail

# ---- Configurable paths ----------------------------------------
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SBOX_DIR="${SBOX_DIR:-$(cd "$SCRIPT_DIR/.." && pwd)/sbox-public}"
WINEPREFIX="${WINEPREFIX:-$HOME/.wine-sbox}"
WINE="${WINE:-wine64}"
DOTNET_VERSION="${DOTNET_VERSION:-10.0}"

# ---- Colors for output ------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

info()  { echo -e "${GREEN}[setup]${NC} $*"; }
warn()  { echo -e "${YELLOW}[setup]${NC} $*"; }
error() { echo -e "${RED}[setup]${NC} $*" >&2; }

# ---- Step 1: Check / Install Wine -------------------------------
info "Step 1: Checking Wine installation ..."

if ! command -v "$WINE" &>/dev/null; then
    warn "Wine not found. Installing Wine CrossOver via Homebrew ..."
    if ! command -v brew &>/dev/null; then
        error "Homebrew is required. Install it from https://brew.sh"
        exit 1
    fi
    brew tap gcenx/wine
    brew install gcenx/wine/wine-crossover
    info "Wine CrossOver installed."
else
    WINE_VERSION=$("$WINE" --version 2>/dev/null || echo "unknown")
    info "Wine found: $WINE_VERSION"
fi

# ---- Step 2: Create Wine prefix ---------------------------------
info "Step 2: Setting up Wine prefix at $WINEPREFIX ..."

export WINEPREFIX
export WINEARCH=win64

if [[ ! -d "$WINEPREFIX/drive_c" ]]; then
    info "Initializing new 64-bit Wine prefix ..."
    WINEDEBUG=-all "$WINE" wineboot --init 2>/dev/null
    info "Wine prefix created."
else
    info "Wine prefix already exists."
fi

# ---- Step 3: .NET Runtime ----------------------------------------
info "Step 3: Checking Windows .NET runtime ..."

DOTNET_DIR="$WINEPREFIX/drive_c/dotnet"

if [[ -f "$DOTNET_DIR/dotnet.exe" ]]; then
    info ".NET runtime already installed at $DOTNET_DIR"
else
    info ".NET runtime not found. Downloading Windows .NET $DOTNET_VERSION x64 ..."

    mkdir -p "$DOTNET_DIR"
    TMPZIP=$(mktemp /tmp/dotnet-runtime-XXXXXX.zip)

    # Try to download the latest .NET runtime for Windows x64
    # The URL pattern for .NET runtime zips
    DOTNET_URL="https://builds.dotnet.microsoft.com/dotnet/Runtime/main/dotnet-runtime-latest-win-x64.zip"

    if command -v curl &>/dev/null; then
        curl -fSL -o "$TMPZIP" "$DOTNET_URL" || {
            error "Failed to download .NET runtime."
            error "Please manually download the Windows x64 .NET $DOTNET_VERSION runtime zip from:"
            error "  https://dotnet.microsoft.com/en-us/download/dotnet/$DOTNET_VERSION"
            error "Extract it to: $DOTNET_DIR"
            rm -f "$TMPZIP"
            exit 1
        }
    elif command -v wget &>/dev/null; then
        wget -O "$TMPZIP" "$DOTNET_URL" || {
            error "Failed to download .NET runtime. See above for manual instructions."
            rm -f "$TMPZIP"
            exit 1
        }
    else
        error "Neither curl nor wget found. Please download manually."
        error "  URL: $DOTNET_URL"
        error "  Extract to: $DOTNET_DIR"
        exit 1
    fi

    info "Extracting .NET runtime ..."
    unzip -qo "$TMPZIP" -d "$DOTNET_DIR"
    rm -f "$TMPZIP"

    if [[ -f "$DOTNET_DIR/dotnet.exe" ]]; then
        info ".NET runtime installed successfully."
    else
        error "Extraction succeeded but dotnet.exe not found. Check $DOTNET_DIR"
        exit 1
    fi
fi

# ---- Step 4: Symlink s&box into Wine prefix ----------------------
info "Step 4: Linking s&box into Wine prefix ..."

SBOX_WINE_DIR="$WINEPREFIX/drive_c/sbox"

if [[ ! -d "$SBOX_DIR" ]]; then
    warn "s&box directory not found at $SBOX_DIR"
    warn "Set SBOX_DIR to your sbox-public checkout path."
    warn "Skipping symlink (you can create it later)."
else
    if [[ -L "$SBOX_WINE_DIR" || -d "$SBOX_WINE_DIR" ]]; then
        info "s&box already linked at $SBOX_WINE_DIR"
    else
        ln -sfn "$SBOX_DIR" "$SBOX_WINE_DIR"
        info "Linked $SBOX_DIR -> $SBOX_WINE_DIR"
    fi
fi

# ---- Step 5: DLL overrides and registry tweaks -------------------
info "Step 5: Configuring Wine for .NET CLR compatibility ..."

# Disable Wine Mono (we use real .NET runtime)
export WINEDLLOVERRIDES="mscoree=d;mshtml=d"

# Write DLL overrides to the registry so they persist
WINEDEBUG=-all "$WINE" reg add "HKCU\\Software\\Wine\\DllOverrides" /v mscoree /t REG_SZ /d "" /f 2>/dev/null || true
WINEDEBUG=-all "$WINE" reg add "HKCU\\Software\\Wine\\DllOverrides" /v mshtml  /t REG_SZ /d "" /f 2>/dev/null || true

info "DLL overrides set (Mono disabled)."

# ---- Step 6: Create macOS data directories -----------------------
info "Step 6: Creating macOS data directories ..."

SBOX_DATA_DIR="${SBOX_DATA_DIR:-$HOME/Library/Application Support/sbox}"
mkdir -p "$SBOX_DATA_DIR"/{config,data,cache,addons,logs}
info "Data directory: $SBOX_DATA_DIR"

# ---- Done --------------------------------------------------------
echo ""
info "=========================================="
info "  Wine prefix setup complete!"
info "=========================================="
echo ""
info "Wine prefix:   $WINEPREFIX"
info ".NET runtime:  $DOTNET_DIR"
info "s&box link:    $SBOX_WINE_DIR"
info "Data dir:      $SBOX_DATA_DIR"
echo ""
info "To run s&box:"
echo "  ./sbox-wine-launcher.sh              # game client"
echo "  ./sbox-wine-launcher.sh --server     # dedicated server"
echo "  ./sbox-wine-launcher.sh --editor     # editor (experimental)"
echo ""
info "If the editor hangs at startup, try:"
echo "  WINEESYNC=0 WINEFSYNC=0 ./sbox-wine-launcher.sh --editor"
echo ""
