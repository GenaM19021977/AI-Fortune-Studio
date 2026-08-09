"""
Оркестратор текста: LLM → при сбое FallbackService (шаг 1.6).

GenerationService (шаг 1.7) будет вызывать generate_text() и сохранять в БД.
Пользователю никогда не показываем traceback провайдера.
"""

from __future__ import annotations

import logging
from typing import Any

from django.conf import settings

from apps.ai.services.fallback import FallbackService
from apps.ai.services.llm import GroqLLMService, LLMError
from apps.ai.services.prompts import build_system_prompt, build_user_prompt
from apps.ai.services.types import GeneratedText

logger = logging.getLogger(__name__)

# Человекочитаемые подписи поводов для user-prompt
_EVENT_LABELS: dict[str, str] = {
    "birthday": "день рождения",
    "wedding": "свадьба",
    "anniversary": "годовщина",
    "new-year": "Новый год",
    "just-because": "просто так",
}


def _persona_context(persona: dict[str, Any]) -> dict[str, Any]:
    """Нормализуем persona dict (из модели .__dict__ или ручного mock в тестах)."""
    return {
        "name": persona.get("name") or "Мудрец",
        "title": persona.get("title") or "",
        "voice_tone": persona.get("voice_tone") or "дружелюбно",
        "signature": persona.get("signature") or "",
        "system_prompt": persona.get("system_prompt") or "",
    }


def _user_context(input_data: dict[str, Any], *, locale: str) -> dict[str, Any]:
    event_slug = (input_data.get("event") or "just-because").strip()
    return {
        "name": (input_data.get("name") or "друг").strip() or "друг",
        "event": event_slug,
        "event_label": _EVENT_LABELS.get(event_slug, event_slug),
        "birth_date": (input_data.get("birth_date") or "").strip(),
        "partner_name": input_data.get("partner_name"),
        "extra": (input_data.get("extra") or "").strip(),
        "locale": locale,
    }


def generate_text(
    *,
    mode_slug: str,
    persona: dict[str, Any],
    input_data: dict[str, Any] | None = None,
    locale: str = "ru",
    llm: GroqLLMService | None = None,
    fallback: FallbackService | None = None,
) -> GeneratedText:
    """
    Пытается Groq; при отсутствии ключа/ошибке — шаблон.

    llm/fallback можно подменить в тестах (без сети).
    """
    input_data = input_data or {}
    persona_ctx = _persona_context(persona)
    fallback_svc = fallback or FallbackService()
    llm_svc = llm or GroqLLMService()

    # Явно выключенный LLM или нет ключа → сразу шаблоны (офлайн-dev)
    use_llm = bool(getattr(settings, "AI_LLM_ENABLED", True)) and llm_svc.is_configured()
    if not use_llm:
        return fallback_svc.generate(
            mode_slug=mode_slug,
            persona=persona_ctx,
            input_data=input_data,
        )

    system_prompt = build_system_prompt(persona_ctx, locale=locale)
    # Доп. system_prompt персонажа из админки — если задан
    extra_system = (persona_ctx.get("system_prompt") or "").strip()
    if extra_system:
        system_prompt = f"{system_prompt}\n\n{extra_system}"

    user_prompt = build_user_prompt(mode_slug, _user_context(input_data, locale=locale))

    try:
        body = llm_svc.complete(system_prompt=system_prompt, user_prompt=user_prompt)
    except LLMError as exc:
        # Graceful degradation: лог для нас, шаблон для пользователя
        logger.info("LLM недоступен, fallback: %s", exc)
        return fallback_svc.generate(
            mode_slug=mode_slug,
            persona=persona_ctx,
            input_data=input_data,
        )

    name = (input_data.get("name") or "друг").strip() or "друг"
    title = _title_for_mode(mode_slug, name)
    persona_name = persona_ctx["name"]
    share = f"✨ {title}\n\n{body}\n\n— {persona_name} | AI Fortune Studio"
    return GeneratedText(title=title, body_text=body, share_text=share, source="llm")


def _title_for_mode(mode_slug: str, name: str) -> str:
    titles = {
        "greeting": f"Поздравление для {name}",
        "horoscope": f"Гороскоп для {name}",
        "poem": f"Стих для {name}",
        "roast": f"Roast для {name}",
    }
    return titles.get(mode_slug, f"Послание для {name}")
