"""
GenerationService — оркестрация текстовой генерации (шаги 1.7–1.9).

Поток (план §10.1):
  квота → validate → Generation(processing) → generate_text → Result → completed
"""

from __future__ import annotations

import logging
from typing import Any

from django.db import transaction

from apps.ai.services import generate_text
from apps.billing.services import QuotaService
from apps.content.models import ContentMode, Generation, GenerationResult, Persona
from apps.users.models import TelegramUser

logger = logging.getLogger(__name__)


class GenerationServiceError(Exception):
    """Бизнес-ошибка генерации (неизвестный mode/persona и т.п.)."""


class GenerationService:
    """
    Создаёт Generation + GenerationResult в локальной БД.

    Квота списывается до LLM (QuotaService.check_and_increment).
    """

    @staticmethod
    def create(user: TelegramUser, data: dict[str, Any]) -> Generation:
        """
        Синхронная текстовая генерация для MVP.

        Raises:
            QuotaExceeded: дневной лимит (view → 429)
            GenerationServiceError: плохой mode/persona
        """
        # 1) Квота до LLM — при лимите не дергаем API
        QuotaService.check_and_increment(user)

        mode = GenerationService._resolve_mode(data.get("content_mode"))
        persona = GenerationService._resolve_persona(data.get("persona_id"))
        input_data = GenerationService._build_input_data(data)

        with transaction.atomic():
            generation = Generation.objects.create(
                user=user,
                content_mode=mode,
                persona=persona,
                input_data=input_data,
                status=Generation.Status.PROCESSING,
            )

        try:
            generated = generate_text(
                mode_slug=mode.slug,
                persona={
                    "name": persona.name,
                    "title": persona.title,
                    "voice_tone": persona.voice_tone,
                    "signature": persona.signature,
                    "system_prompt": persona.system_prompt,
                },
                input_data=input_data,
                locale=_locale_for_user(user),
            )
        except Exception as exc:  # noqa: BLE001 — любой сбой AI → failed, без traceback юзеру
            logger.exception("Generation %s failed", generation.id)
            generation.status = Generation.Status.FAILED
            generation.error_message = str(exc)[:2000]
            generation.save(update_fields=["status", "error_message", "updated_at"])
            return generation

        source = (
            GenerationResult.Source.LLM
            if generated.source == "llm"
            else GenerationResult.Source.TEMPLATE
        )
        with transaction.atomic():
            GenerationResult.objects.create(
                generation=generation,
                title=generated.title[:255],
                body_text=generated.body_text,
                share_text=generated.share_text,
                source=source,
            )
            generation.status = Generation.Status.COMPLETED
            generation.error_message = ""
            generation.save(update_fields=["status", "error_message", "updated_at"])

        generation.refresh_from_db()
        return generation

    @staticmethod
    def _resolve_mode(slug: Any) -> ContentMode:
        if not slug or not isinstance(slug, str):
            raise GenerationServiceError("Укажите content_mode (slug режима).")
        try:
            return ContentMode.objects.get(slug=slug.strip(), is_active=True)
        except ContentMode.DoesNotExist as exc:
            raise GenerationServiceError(f"Неизвестный или неактивный режим: {slug}") from exc

    @staticmethod
    def _resolve_persona(slug: Any) -> Persona:
        if not slug or not isinstance(slug, str):
            raise GenerationServiceError("Укажите persona_id (slug персонажа).")
        try:
            return Persona.objects.get(slug=slug.strip(), is_active=True)
        except Persona.DoesNotExist as exc:
            raise GenerationServiceError(f"Неизвестный или неактивный персонаж: {slug}") from exc

    @staticmethod
    def _build_input_data(data: dict[str, Any]) -> dict[str, Any]:
        """Вырезаем только поля мастера (§6.3), остальное игнорируем."""
        return {
            "name": data.get("name") or "",
            "birth_date": data.get("birth_date") or "",
            "event": data.get("event") or "",
            "partner_name": data.get("partner_name"),
            "extra": data.get("extra") or "",
        }


def _locale_for_user(user: TelegramUser) -> str:
    """Локаль из UserSettings, иначе language_code Telegram, иначе ru."""
    user_settings = getattr(user, "settings", None)
    if user_settings and user_settings.locale:
        return user_settings.locale
    return user.language_code or "ru"
