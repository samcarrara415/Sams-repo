#!/usr/bin/env bash
# =================================================================
#  s&box macOS Installer
#
#  One command to clone, patch, build, and set up s&box on macOS.
#
#  Usage:
#    ./install.sh              # full install (clone + patch + build + Wine)
#    ./install.sh --no-wine    # build only, skip Wine setup
#    ./install.sh --wine-only  # just set up Wine (if already built)
# =================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SBOX_DIR="${SBOX_DIR:-$SCRIPT_DIR/sbox-public}"
WINEPREFIX="${WINEPREFIX:-$HOME/.wine-sbox}"

# ---- Colors -----------------------------------------------------
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

step()  { echo -e "\n${CYAN}${BOLD}==>${NC}${BOLD} $*${NC}"; }
info()  { echo -e "  ${GREEN}✓${NC} $*"; }
warn()  { echo -e "  ${YELLOW}!${NC} $*"; }
error() { echo -e "  ${RED}✗${NC} $*" >&2; }

# ---- Parse args --------------------------------------------------
DO_CLONE=true
DO_BUILD=true
DO_WINE=true

for arg in "$@"; do
    case "$arg" in
        --no-wine)    DO_WINE=false ;;
        --wine-only)  DO_CLONE=false; DO_BUILD=false ;;
        --help|-h)
            echo "Usage: ./install.sh [--no-wine | --wine-only]"
            echo ""
            echo "  (default)     Full install: clone, patch, build, Wine setup"
            echo "  --no-wine     Clone, patch, and build only (no Wine prefix)"
            echo "  --wine-only   Set up Wine prefix only (skip clone/build)"
            echo ""
            echo "Environment variables:"
            echo "  SBOX_DIR      Path for sbox-public checkout (default: ./sbox-public)"
            echo "  WINEPREFIX    Wine prefix path (default: ~/.wine-sbox)"
            exit 0
            ;;
        *)
            error "Unknown argument: $arg"
            exit 1
            ;;
    esac
done

# ---- Banner ------------------------------------------------------
echo -e "${BOLD}"
echo "  ┌─────────────────────────────────────────┐"
echo "  │   s&box macOS Installer (Apple Silicon)  │"
echo "  └─────────────────────────────────────────┘"
echo -e "${NC}"

# ---- Check prerequisites ----------------------------------------
step "Checking prerequisites"

MISSING=()

if ! command -v git &>/dev/null; then
    MISSING+=("git")
fi

if $DO_BUILD; then
    if ! command -v dotnet &>/dev/null; then
        MISSING+=("dotnet-sdk  (brew install dotnet-sdk)")
    fi
fi

if $DO_WINE; then
    if ! command -v wine64 &>/dev/null; then
        MISSING+=("wine-crossover  (brew install gcenx/wine/wine-crossover)")
    fi
fi

if [[ ${#MISSING[@]} -gt 0 ]]; then
    error "Missing required tools:"
    for m in "${MISSING[@]}"; do
        echo "    - $m"
    done

    # Offer to install via Homebrew
    if command -v brew &>/dev/null; then
        echo ""
        read -rp "  Install missing tools via Homebrew? [y/N] " REPLY
        if [[ "$REPLY" =~ ^[Yy]$ ]]; then
            for m in "${MISSING[@]}"; do
                tool="${m%% *}"  # first word only
                case "$tool" in
                    dotnet-sdk)
                        brew install dotnet-sdk ;;
                    wine-crossover)
                        brew tap gcenx/wine 2>/dev/null || true
                        brew install gcenx/wine/wine-crossover ;;
                    git)
                        brew install git ;;
                esac
            done
            info "Dependencies installed."
        else
            exit 1
        fi
    else
        error "Install Homebrew first: https://brew.sh"
        exit 1
    fi
else
    info "All prerequisites found."
fi

# ---- Step 1: Clone -----------------------------------------------
if $DO_CLONE; then
    step "Step 1/4: Cloning s&box source"

    if [[ -d "$SBOX_DIR/.git" ]]; then
        info "Already cloned at $SBOX_DIR"
        info "Pulling latest ..."
        git -C "$SBOX_DIR" pull --ff-only 2>/dev/null || warn "Pull failed (offline?), continuing with existing checkout."
    else
        info "Cloning sbox-public ..."
        git clone https://github.com/Facepunch/sbox-public.git "$SBOX_DIR"
        info "Cloned to $SBOX_DIR"
    fi
else
    step "Step 1/4: Clone (skipped)"
fi

# ---- Step 2: Patch -----------------------------------------------
if $DO_CLONE; then
    step "Step 2/4: Applying macOS patches"

    cd "$SBOX_DIR"

    # Check if patches are already applied by looking for our marker
    if grep -q "IsRunningUnderWine" engine/Sandbox.AppSystem/AppSystem.cs 2>/dev/null; then
        info "Patches already applied."
    else
        # Apply the unified patch
        if [[ -f "$SCRIPT_DIR/sbox-macos-crossplatform.patch" ]]; then
            git apply "$SCRIPT_DIR/sbox-macos-crossplatform.patch" && info "Applied sbox-macos-crossplatform.patch" || {
                warn "Patch didn't apply cleanly (may already be partially applied)."
                warn "Trying with --3way ..."
                git apply --3way "$SCRIPT_DIR/sbox-macos-crossplatform.patch" || true
            }
        fi

        # Copy the full patched engine files over (these include changes
        # beyond what the .patch covers, like the large interop files)
        info "Copying patched engine files ..."
        for src in "$SCRIPT_DIR"/engine/*/; do
            module=$(basename "$src")
            if [[ -d "$SBOX_DIR/engine/$module" ]]; then
                cp -v "$src"*.cs "$SBOX_DIR/engine/$module/" 2>/dev/null || true

                # Handle nested directories (Tests/)
                if [[ -d "$src/Tests" ]]; then
                    mkdir -p "$SBOX_DIR/engine/$module/Tests/"
                    cp -v "$src"/Tests/*.cs "$SBOX_DIR/engine/$module/Tests/" 2>/dev/null || true
                fi
            fi
        done
        info "Engine files patched."
    fi

    cd "$SCRIPT_DIR"
else
    step "Step 2/4: Patch (skipped)"
fi

# ---- Step 3: Build -----------------------------------------------
if $DO_BUILD; then
    step "Step 3/4: Building s&box"

    cd "$SBOX_DIR"

    info "Running SboxBuild (this may take a few minutes) ..."
    if dotnet run --project ./engine/Tools/SboxBuild/SboxBuild.csproj -- build --config Developer; then
        info "Build successful! (0 errors, 0 warnings expected)"
    else
        error "Build failed. Check output above."
        error "You may need to apply patches manually if the source has diverged."
        exit 1
    fi

    cd "$SCRIPT_DIR"
else
    step "Step 3/4: Build (skipped)"
fi

# ---- Step 4: Wine setup ------------------------------------------
if $DO_WINE; then
    step "Step 4/4: Setting up Wine"
    export SBOX_DIR
    "$SCRIPT_DIR/sbox-wine-setup.sh"
else
    step "Step 4/4: Wine setup (skipped)"
fi

# ---- Done ---------------------------------------------------------
echo ""
echo -e "${GREEN}${BOLD}  ┌─────────────────────────────────────────┐${NC}"
echo -e "${GREEN}${BOLD}  │        Installation complete!            │${NC}"
echo -e "${GREEN}${BOLD}  └─────────────────────────────────────────┘${NC}"
echo ""
echo "  Run s&box:"
echo ""
echo -e "    ${CYAN}./sbox-wine-launcher.sh${NC}              # game client"
echo -e "    ${CYAN}./sbox-wine-launcher.sh --server${NC}     # dedicated server"
echo -e "    ${CYAN}./sbox-wine-launcher.sh --editor${NC}     # editor (experimental)"
echo ""
echo "  Run tests:"
echo ""
echo -e "    ${CYAN}make test${NC}                            # native macOS tests"
echo -e "    ${CYAN}./sbox-wine-launcher.sh --test${NC}       # tests via Wine"
echo ""
echo "  For troubleshooting, see README.md"
echo ""
