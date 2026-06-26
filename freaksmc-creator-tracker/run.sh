#!/usr/bin/env bash
# One-command launcher: sets up a local virtualenv, installs deps, runs the app.
set -e
cd "$(dirname "$0")"

if [ ! -d ".venv" ]; then
  echo "Creating virtualenv (.venv)…"
  python3 -m venv .venv
fi

# shellcheck disable=SC1091
source .venv/bin/activate
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt

echo "Starting FreaksMC Creator Tracker at http://127.0.0.1:5000  (Ctrl+C to stop)"
python app.py
