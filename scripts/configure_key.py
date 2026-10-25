"""Save a key with hidden terminal input, without putting it in shell history."""
from getpass import getpass
from pathlib import Path
import os

ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    path = ROOT / ".env"
    key = getpass("Paste your group API key (hidden): ").strip()
    if not key or any(character.isspace() for character in key):
        raise SystemExit("Key not saved: enter one non-empty key without whitespace.")
    content = path.read_text(encoding="utf-8") if path.exists() else (ROOT / ".env.example").read_text(encoding="utf-8")
    lines = content.splitlines()
    lines = [line for line in lines if not line.startswith("BAILIAN_API_KEY=")]
    lines.append(f"BAILIAN_API_KEY={key}")
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "w", encoding="utf-8") as output:
        output.write("\n".join(lines) + "\n")
    if os.name != "nt":
        path.chmod(0o600)
    print("Key saved to ignored local .env. Restart the app to load it.")


if __name__ == "__main__":
    main()
