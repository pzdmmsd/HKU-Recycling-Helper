"""Local, cross-platform launcher. Never prints configuration secrets."""
from __future__ import annotations

import argparse
import os
from pathlib import Path
import socket
import sys
import threading
import time
import webbrowser


def available_port(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as probe:
        try:
            probe.bind(("127.0.0.1", port))
        except OSError:
            return False
    return True


def choose_port(requested: int | None) -> int | None:
    if requested is not None:
        return requested if available_port(requested) else None
    for port in [8000, *range(8001, 8011), 8080, 8765]:
        if available_port(port):
            return port
    return None


def open_browser_later(url: str) -> None:
    if os.environ.get("HKU_NO_BROWSER") == "1":
        return
    time.sleep(1.2)
    webbrowser.open(url)


def main() -> int:
    parser = argparse.ArgumentParser(description="Start HKU Recycling Helper locally")
    parser.add_argument("--port", type=int, default=None,
                        help="Port to use; defaults to the first free port from 8000-8010, 8080, 8765")
    args = parser.parse_args()
    if sys.version_info < (3, 12):
        print("Python 3.12 or newer is required. See README.md.")
        return 1
    if args.port is not None and not 1024 <= args.port <= 65535:
        parser.error("Choose a port from 1024 to 65535.")
    port = choose_port(args.port)
    if port is None:
        if args.port is None:
            print("No local port was available. Try: python launch.py --port 9000")
        else:
            print(f"Port {args.port} is reserved or unavailable. Try: python launch.py --port 9000")
        return 1
    try:
        import uvicorn
    except ImportError:
        print("Dependencies missing. Run: python -m pip install -r requirements.txt")
        return 1
    root = Path(__file__).resolve().parent
    sys.path.insert(0, str(root))
    url = f"http://127.0.0.1:{port}"
    if args.port is None and port != 8000:
        print(f"Port 8000 is unavailable; using {port} instead.")
    print(f"\nHKU Recycling Helper - Group 73\nOpen {url}\n")
    print("Sample mode works without an API key. Press Ctrl+C to stop.\n", flush=True)
    threading.Thread(target=open_browser_later, args=(url,), daemon=True).start()
    uvicorn.run("app.main:app", host="127.0.0.1", port=port,
                access_log=False, log_level="warning", workers=1)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
