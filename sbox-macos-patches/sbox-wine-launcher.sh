#!/usr/bin/env bash
# -----------------------------------------------------------------
#  sbox-wine-launcher.sh  --  Launch s&box on macOS via Wine/CrossOver
#
#  Usage:
#    ./sbox-wine-launcher.sh                     # game client
#    ./sbox-wine-launcher.sh --server            # dedicated server
#    ./sbox-wine-launcher.sh --editor            # editor (experimental)
#    ./sbox-wine-launcher.sh --test              # unit tests
#
#  Prerequisites:
#    brew install gcenx/wine/wine-crossover
#    Windows .NET 10 runtime extracted to $WINEPREFIX/drive_c/dotnet/
# -----------------------------------------------------------------
set -euo pipefail

# ---- Configurable paths ----------------------------------------
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SBOX_DIR="${SBOX_DIR:-$(cd "$SCRIPT_DIR/.." && pwd)/sbox-public}"
WINEPREFIX="${WINEPREFIX:-$HOME/.wine-sbox}"
WINE="${WINE:-wine64}"

# Windows-side paths inside the Wine prefix
WIN_DOTNET="C:\\dotnet\\dotnet.exe"
WIN_SBOX="C:\\sbox"

# ---- Detect Apple Silicon vs Intel ------------------------------
ARCH="$(uname -m)"
if [[ "$ARCH" == "arm64" ]]; then
    echo "[sbox] Running on Apple Silicon (ARM64) -- Rosetta x86_64 translation active"
fi

# ---- Create / validate Wine prefix -----------------------------
if [[ ! -d "$WINEPREFIX/drive_c" ]]; then
    echo "[sbox] Creating Wine prefix at $WINEPREFIX ..."
    WINEPREFIX="$WINEPREFIX" WINEARCH=win64 "$WINE" wineboot --init 2>/dev/null
    echo "[sbox] Wine prefix created."
fi

# Check .NET runtime
if [[ ! -f "$WINEPREFIX/drive_c/dotnet/dotnet.exe" ]]; then
    echo "[sbox] ERROR: Windows .NET runtime not found at $WINEPREFIX/drive_c/dotnet/"
    echo "       Download the .NET 10 Windows x64 runtime zip and extract it there."
    echo "       https://dotnet.microsoft.com/en-us/download/dotnet/10.0"
    exit 1
fi

# Symlink / copy s&box into the Wine prefix
SBOX_WINE_DIR="$WINEPREFIX/drive_c/sbox"
if [[ ! -d "$SBOX_WINE_DIR" ]]; then
    echo "[sbox] Linking s&box into Wine prefix ..."
    ln -sfn "$SBOX_DIR" "$SBOX_WINE_DIR"
fi

# ---- Wine environment -------------------------------------------

export WINEPREFIX
export WINEARCH=win64

# Suppress noisy Wine debug output by default
export WINEDEBUG="${WINEDEBUG:--all}"

# ---- CLR / loader deadlock workarounds --------------------------
#
# The .NET CLR can deadlock with Wine's loader_section lock during
# initialization. These environment variables help mitigate it:
#

# 1. Wine esync/fsync -- use eventfd-based synchronisation instead of
#    wineserver round-trips. Reduces lock contention during CLR startup.
export WINEESYNC="${WINEESYNC:-1}"
export WINEFSYNC="${WINEFSYNC:-1}"

# 2. Disable Wine's debug channels that can cause lock contention
#    during thread creation (CLR creates many threads at startup).
export WINEDEBUG="${WINEDEBUG},+timestamp,-relay,-tid,-pid,-seh,-debugstr"

# 3. Large address aware -- .NET runtime benefits from expanded address space
export WINE_LARGE_ADDRESS_AWARE=1

# 4. Mono -- we use the real .NET runtime, not Wine's Mono. Disable it.
export WINEDLLOVERRIDES="${WINEDLLOVERRIDES:-}${WINEDLLOVERRIDES:+;}mscoree=d;mshtml=d"

# 5. Threading -- ensure pthreads are used (default on modern Wine,
#    but be explicit for CrossOver compatibility).
export WINE_PTHREAD_STACK_SIZE="${WINE_PTHREAD_STACK_SIZE:-8388608}"

# 6. MoltenVK / Vulkan -- macOS needs MoltenVK as the Vulkan ICD.
#    If DXVK or VKD3D is used, this ensures it finds the right driver.
if [[ -z "${MVK_CONFIG_FULL_IMAGE_VIEW_SWIZZLE:-}" ]]; then
    export MVK_CONFIG_FULL_IMAGE_VIEW_SWIZZLE=1
fi
if [[ -z "${MVK_CONFIG_USE_METAL_ARGUMENT_BUFFERS:-}" ]]; then
    export MVK_CONFIG_USE_METAL_ARGUMENT_BUFFERS=2
fi

# 7. Tell the managed engine it's running under Wine on macOS.
#    The patched AppSystem.cs reads this to select correct code paths.
export SBOX_WINE_COMPAT=1

# ---- macOS data directory ----------------------------------------
SBOX_DATA_DIR="${SBOX_DATA_DIR:-$HOME/Library/Application Support/sbox}"
export SBOX_DATA_DIR
mkdir -p "$SBOX_DATA_DIR"/{config,data,cache,addons,logs}

# ---- Parse mode --------------------------------------------------
MODE="client"
EXTRA_ARGS=()

for arg in "$@"; do
    case "$arg" in
        --server)   MODE="server" ;;
        --editor)   MODE="editor" ;;
        --test)     MODE="test" ;;
        *)          EXTRA_ARGS+=("$arg") ;;
    esac
done

# ---- Launch ------------------------------------------------------
echo "[sbox] Mode: $MODE"
echo "[sbox] Wine prefix: $WINEPREFIX"
echo "[sbox] s&box dir: $SBOX_DIR"
echo "[sbox] Data dir: $SBOX_DATA_DIR"
echo ""

case "$MODE" in
    server)
        echo "[sbox] Starting dedicated server ..."
        "$WINE" "$WIN_DOTNET" exec "$WIN_SBOX\\sbox-server.dll" "${EXTRA_ARGS[@]+"${EXTRA_ARGS[@]}"}"
        ;;
    editor)
        echo "[sbox] Starting editor (experimental -- may deadlock on Wine < 9) ..."
        echo "[sbox] If it hangs, try: WINEESYNC=0 WINEFSYNC=0 $0 --editor"
        echo ""

        # The editor loads toolframework2.dll + Qt. Give it extra stack
        # and disable the managed threadpool ceiling to reduce contention.
        export COMPlus_ThreadPool_ForceMinWorkerThreads=8
        export DOTNET_ThreadPool_ForceMinWorkerThreads=8

        "$WINE" "$WIN_DOTNET" exec "$WIN_SBOX\\sbox.dll" "${EXTRA_ARGS[@]+"${EXTRA_ARGS[@]}"}"
        ;;
    test)
        echo "[sbox] Running unit tests via Wine ..."
        "$WINE" "$WIN_DOTNET" test "$WIN_SBOX\\engine\\Sandbox.Compiling.Test\\bin\\Release\\net10.0\\Sandbox.Compiling.Test.dll" "${EXTRA_ARGS[@]+"${EXTRA_ARGS[@]}"}"
        ;;
    client)
        echo "[sbox] Starting game client ..."
        "$WINE" "$WIN_DOTNET" exec "$WIN_SBOX\\sbox.dll" "${EXTRA_ARGS[@]+"${EXTRA_ARGS[@]}"}"
        ;;
esac

EXIT_CODE=$?
if [[ $EXIT_CODE -ne 0 ]]; then
    echo ""
    echo "[sbox] Process exited with code $EXIT_CODE"
    if [[ $EXIT_CODE -eq 137 || $EXIT_CODE -eq 139 ]]; then
        echo "[sbox] This looks like a crash (signal). Check $SBOX_DATA_DIR/logs/ for details."
    fi
fi
exit $EXIT_CODE
