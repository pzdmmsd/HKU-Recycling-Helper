"""Save a key with hidden terminal input, without putting it in shell history."""
from getpass import getpass
from io import StringIO
from pathlib import Path
import os
import sys

from dotenv import dotenv_values

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.config import DEFAULT_BASE_URL, DEFAULT_MODEL


def main() -> None:
    path = ROOT / ".env"
    key = getpass("Paste your NVIDIA API key (hidden): ").strip()
    if not key or any(character.isspace() for character in key):
        raise SystemExit("Key not saved: enter one non-empty key without whitespace.")
    content = path.read_text(encoding="utf-8") if path.exists() else (ROOT / ".env.example").read_text(encoding="utf-8")
    lines = content.splitlines()
    values = dotenv_values(stream=StringIO(content))
    updates = {"NVIDIA_API_KEY": key, "AI_BASE_URL": DEFAULT_BASE_URL}
    # Keep an explicitly selected NVIDIA model when replacing a key later.
    updates["AI_MODEL"] = (
        values["AI_MODEL"]
        if (values.get("AI_BASE_URL") or "").rstrip("/") == DEFAULT_BASE_URL and values.get("AI_MODEL")
        else DEFAULT_MODEL
    )
    replaced = set(updates) | {"BAILIAN_API_KEY", "AI_API_KEY"}
    lines = [line for line in lines if line.split("=", 1)[0].strip().removeprefix("export ").strip() not in replaced]
    lines.extend(f"{name}={value}" for name, value in updates.items())
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "w", encoding="utf-8") as output:
        output.write("\n".join(lines) + "\n")
    if os.name != "nt":
        path.chmod(0o600)
    print("Key saved to ignored local .env. Restart the app to load it.")


if __name__ == "__main__":
    main()
