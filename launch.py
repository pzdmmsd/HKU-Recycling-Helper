"""Local, cross-platform launcher. Never prints configuration secrets."""
from __future__ import annotations

import argparse
from pathlib import Path
import socket
import sys


def main() -> int:
    parser = argparse.ArgumentParser(description="Start HKU Recycling Helper locally")
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()
    if sys.version_info < (3, 12):
        print("Python 3.12 or newer is required. See README.md.")
        return 1
    if not 1024 <= args.port <= 65535:
        parser.error("Choose a port from 1024 to 65535.")
    with socket.socket() as probe:
        try:
            probe.bind(("127.0.0.1", args.port))
        except PermissionError:
            print("Local server permission was denied. Allow this process to bind to localhost, then try again.")
            return 1
        except OSError:
            print(f"Port {args.port} is unavailable. Try: python launch.py --port 8001")
            return 1
    try:
        import uvicorn
    except ImportError:
        print("Dependencies missing. Run: python -m pip install -r requirements.txt")
        return 1
    root = Path(__file__).resolve().parent
    sys.path.insert(0, str(root))
    print(f"\nHKU Recycling Helper — Group 73\nOpen http://127.0.0.1:{args.port}\n")
    print("Sample mode works without an API key. Press Ctrl+C to stop.\n", flush=True)
    uvicorn.run("app.main:app", host="127.0.0.1", port=args.port,
                access_log=False, log_level="warning", workers=1)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
