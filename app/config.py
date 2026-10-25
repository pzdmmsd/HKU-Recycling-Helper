"""Read credentials on the server only. Never expose Settings as API JSON."""

import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv


ROOT = Path(__file__).resolve().parents[1]
PROVIDER = "Alibaba Cloud Bailian"
DEFAULT_BASE_URL = "https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1"
PROMPT_VERSION = "recycling-skill-1.0.0"


@dataclass(frozen=True)
class Settings:
    api_key: str = field(default="", repr=False)
    base_url: str = DEFAULT_BASE_URL
    model: str = "qwen3.8-flash"
    timeout_seconds: float = 45.0
    max_tokens: int = 800
    temperature: float = 0.1
    data_dir: Path = ROOT / "data"
    skill_path: Path = ROOT / "SKILL.md"
    static_dir: Path = ROOT / "static"

    @classmethod
    def from_env(cls) -> "Settings":
        load_dotenv(ROOT / ".env", override=False)
        return cls(
            api_key=os.getenv("BAILIAN_API_KEY", os.getenv("AI_API_KEY", "")).strip(),
            base_url=os.getenv("AI_BASE_URL", DEFAULT_BASE_URL).rstrip("/"),
            model=os.getenv("AI_MODEL", "qwen3.8-flash").strip(),
            timeout_seconds=max(5.0, min(60.0, float(os.getenv("AI_TIMEOUT_SECONDS", "45")))),
            max_tokens=max(128, min(1200, int(os.getenv("AI_MAX_TOKENS", "800")))),
            temperature=max(0.0, min(0.2, float(os.getenv("AI_TEMPERATURE", "0.1")))),
        )
