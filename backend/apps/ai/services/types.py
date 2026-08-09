"""
Общий результат текстовой генерации (шаг 1.6).

source=llm — ответ Groq; template — graceful fallback без ключа/при ошибке.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

TextSource = Literal["llm", "template"]


@dataclass(frozen=True)
class GeneratedText:
    """Готовый текст для GenerationResult (шаг 1.7 сохранит в БД)."""

    title: str
    body_text: str
    share_text: str
    source: TextSource
