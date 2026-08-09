"""
Сервис «предсказание дня» (GET /api/v1/daily-fortune/, шаг 1.10).

Не списывает UsageQuota — это бесплатная ежедневная фича.
Выбор персонажа детерминирован по (telegram_id + дата), чтобы за день
один и тот же текст (кэш + стабильный хэш).
"""

from __future__ import annotations

import hashlib
from typing import Any

from django.core.cache import cache
from django.utils import timezone

from apps.ai.services import generate_text
from apps.content.models import Persona
from apps.users.models import TelegramUser


def get_daily_fortune(user: TelegramUser) -> dict[str, Any]:
    """
    Возвращает dict для JSON-ответа daily-fortune.

    При пустом каталоге персонажей — мягкий fallback без Persona.
    """
    today = timezone.localdate()
    cache_key = f"daily-fortune:{user.telegram_id}:{today.isoformat()}"
    cached = cache.get(cache_key)
    if isinstance(cached, dict):
        return cached

    persona = _pick_persona_for_day(user.telegram_id, today.isoformat())
    display_name = (user.first_name or user.username or "друг").strip() or "друг"

    if persona is None:
        payload = {
            "date": today.isoformat(),
            "title": f"Предсказание дня для {display_name}",
            "body": (
                f"{display_name}, сегодня хороший день, чтобы сделать маленький шаг "
                f"к большой мечте. Вселенная уже подмигнула."
            ),
            "share_text": "",
            "persona": "AI Fortune Studio",
            "persona_slug": None,
            "source": "template",
        }
        payload["share_text"] = (
            f"✨ {payload['title']}\n\n{payload['body']}\n\n— AI Fortune Studio"
        )
        cache.set(cache_key, payload, timeout=86_400)
        return payload

    generated = generate_text(
        mode_slug="horoscope",
        persona={
            "name": persona.name,
            "title": persona.title,
            "voice_tone": persona.voice_tone,
            "signature": persona.signature,
            "system_prompt": persona.system_prompt,
        },
        input_data={
            "name": display_name,
            "event": "just-because",
            "extra": "предсказание дня",
        },
        locale=_locale_for_user(user),
    )

    payload = {
        "date": today.isoformat(),
        "title": generated.title,
        "body": generated.body_text,
        "share_text": generated.share_text,
        "persona": persona.name,
        "persona_slug": persona.slug,
        "source": generated.source,
    }
    cache.set(cache_key, payload, timeout=86_400)
    return payload


def _pick_persona_for_day(telegram_id: int, day_iso: str) -> Persona | None:
    """Стабильный выбор персонажа на день (md5, не hash())."""
    personas = list(
        Persona.objects.filter(is_active=True, is_premium=False).order_by("id")
    )
    if not personas:
        personas = list(Persona.objects.filter(is_active=True).order_by("id"))
    if not personas:
        return None

    digest = hashlib.md5(f"{telegram_id}:{day_iso}".encode("utf-8")).hexdigest()
    index = int(digest, 16) % len(personas)
    return personas[index]


def _locale_for_user(user: TelegramUser) -> str:
    settings_obj = getattr(user, "settings", None)
    if settings_obj and settings_obj.locale:
        return settings_obj.locale
    return user.language_code or "ru"
