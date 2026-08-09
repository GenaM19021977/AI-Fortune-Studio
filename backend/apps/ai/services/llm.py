"""
Клиент LLM: Groq OpenAI-compatible API (шаг 1.6).

Без ключа / при таймауте / HTTP-ошибке — кидаем LLMError,
чтобы оркестратор ушёл в FallbackService (пользователь не видит traceback).
"""

from __future__ import annotations

import logging
from typing import Any

import httpx
from django.conf import settings

logger = logging.getLogger(__name__)


class LLMError(Exception):
    """Любая ошибка LLM-слоя: нет ключа, сеть, пустой ответ, таймаут."""


class GroqLLMService:
    """
    Минимальный chat-completions клиент к https://api.groq.com.

    Не тянем openai SDK на этом шаге — httpx достаточно и легче мокать в тестах.
    """

    def __init__(
        self,
        *,
        api_key: str | None = None,
        model: str | None = None,
        timeout_seconds: float | None = None,
        base_url: str | None = None,
    ) -> None:
        self.api_key = (api_key if api_key is not None else getattr(settings, "GROQ_API_KEY", "")) or ""
        self.model = model or getattr(settings, "GROQ_MODEL", "llama-3.3-70b-versatile")
        self.timeout_seconds = float(
            timeout_seconds
            if timeout_seconds is not None
            else getattr(settings, "LLM_TIMEOUT_SECONDS", 15)
        )
        self.base_url = (
            base_url or getattr(settings, "GROQ_BASE_URL", "https://api.groq.com/openai/v1")
        ).rstrip("/")

    def is_configured(self) -> bool:
        """Есть ли ключ — иначе оркестратор сразу идёт в fallback."""
        return bool(self.api_key.strip())

    def complete(self, *, system_prompt: str, user_prompt: str) -> str:
        """
        Один chat-запрос. Возвращает текст ассистента.

        Raises:
            LLMError: нет ключа, сеть, не-200, пустой choices.
        """
        if not self.is_configured():
            raise LLMError("GROQ_API_KEY не задан.")

        url = f"{self.base_url}/chat/completions"
        payload: dict[str, Any] = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": 0.8,
            # Короткие тексты для мессенджера — не раздуваем max_tokens
            "max_tokens": int(getattr(settings, "LLM_MAX_TOKENS", 512)),
        }
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        try:
            with httpx.Client(timeout=self.timeout_seconds) as client:
                response = client.post(url, json=payload, headers=headers)
        except httpx.TimeoutException as exc:
            raise LLMError(f"Таймаут LLM ({self.timeout_seconds}s).") from exc
        except httpx.HTTPError as exc:
            raise LLMError(f"Сеть LLM: {exc}") from exc

        if response.status_code >= 400:
            # Тело не логируем целиком — могут быть лишние детали провайдера
            logger.warning("Groq HTTP %s", response.status_code)
            raise LLMError(f"Groq вернул HTTP {response.status_code}.")

        try:
            data = response.json()
            text = data["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError, ValueError) as exc:
            raise LLMError("Некорректный ответ Groq.") from exc

        text = (text or "").strip()
        if not text:
            raise LLMError("Пустой ответ LLM.")
        return text
