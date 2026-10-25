#!/bin/sh
set -eu
cd "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
if ! command -v python3 >/dev/null 2>&1; then
  echo "Install Python 3.12 or newer. See README.md."
  exit 1
fi
python3 -c 'import sys; sys.exit(0 if sys.version_info >= (3,12) else "Python 3.12 or newer is required.")'
if [ ! -x .venv/bin/python ]; then
  python3 -m venv .venv
fi
if ! .venv/bin/python -c 'from pathlib import Path; import hashlib,sys; p=Path(".venv/hku-requirements.sha256"); sys.exit(0 if p.exists() and p.read_text().strip()==hashlib.sha256(Path("requirements.txt").read_bytes()).hexdigest() else 1)'; then
  .venv/bin/python -m pip install -r requirements.txt
  .venv/bin/python -c 'from pathlib import Path; import hashlib; Path(".venv/hku-requirements.sha256").write_text(hashlib.sha256(Path("requirements.txt").read_bytes()).hexdigest())'
fi
if [ ! -f .env ]; then
  cp .env.example .env
  chmod 600 .env
fi
exec .venv/bin/python launch.py "$@"

