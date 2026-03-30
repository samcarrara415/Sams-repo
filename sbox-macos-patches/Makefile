# s&box macOS Build System
# ========================
#
# Usage:
#   make install      # full install (clone + patch + build + Wine)
#   make build        # build only (assumes sbox-public exists and is patched)
#   make test         # run unit tests natively on macOS
#   make run          # launch game client via Wine
#   make server       # launch dedicated server via Wine
#   make editor       # launch editor via Wine (experimental)
#   make setup-wine   # set up Wine prefix only
#   make clean        # remove build artifacts
#   make uninstall    # remove sbox-public and Wine prefix

SHELL := /bin/bash
SCRIPT_DIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
SBOX_DIR ?= $(SCRIPT_DIR)sbox-public
WINEPREFIX ?= $(HOME)/.wine-sbox

export SBOX_DIR
export WINEPREFIX

.PHONY: install build test run server editor setup-wine clean uninstall help

# Default target
help:
	@echo ""
	@echo "  s&box macOS — Available targets:"
	@echo ""
	@echo "    make install      Full install (clone + patch + build + Wine)"
	@echo "    make build        Build s&box (assumes source is patched)"
	@echo "    make test         Run unit tests natively"
	@echo "    make run          Launch game client via Wine"
	@echo "    make server       Launch dedicated server via Wine"
	@echo "    make editor       Launch editor via Wine (experimental)"
	@echo "    make setup-wine   Set up Wine prefix only"
	@echo "    make clean        Remove build artifacts"
	@echo "    make uninstall    Remove sbox-public checkout and Wine prefix"
	@echo ""

install:
	@$(SCRIPT_DIR)install.sh

build:
	@cd "$(SBOX_DIR)" && \
		dotnet run --project ./engine/Tools/SboxBuild/SboxBuild.csproj -- build --config Developer

test:
	@cd "$(SBOX_DIR)" && \
		dotnet test engine/Sandbox.Compiling.Test/bin/Release/net10.0/Sandbox.Compiling.Test.dll && \
		dotnet test engine/Sandbox.Hotload.Test/bin/Release/net10.0/Sandbox.Hotload.Test.dll

run:
	@$(SCRIPT_DIR)sbox-wine-launcher.sh

server:
	@$(SCRIPT_DIR)sbox-wine-launcher.sh --server

editor:
	@$(SCRIPT_DIR)sbox-wine-launcher.sh --editor

setup-wine:
	@$(SCRIPT_DIR)sbox-wine-setup.sh

clean:
	@echo "Cleaning build artifacts ..."
	@if [ -d "$(SBOX_DIR)" ]; then \
		cd "$(SBOX_DIR)" && \
		find . -type d -name "bin" -path "*/engine/*" -exec rm -rf {} + 2>/dev/null; \
		find . -type d -name "obj" -path "*/engine/*" -exec rm -rf {} + 2>/dev/null; \
		echo "  Done."; \
	else \
		echo "  Nothing to clean ($(SBOX_DIR) not found)."; \
	fi

uninstall:
	@echo ""
	@echo "  This will remove:"
	@echo "    - $(SBOX_DIR)"
	@echo "    - $(WINEPREFIX)"
	@echo ""
	@read -rp "  Are you sure? [y/N] " confirm && \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		rm -rf "$(SBOX_DIR)" && echo "  Removed $(SBOX_DIR)"; \
		rm -rf "$(WINEPREFIX)" && echo "  Removed $(WINEPREFIX)"; \
		echo "  Done."; \
	else \
		echo "  Cancelled."; \
	fi
