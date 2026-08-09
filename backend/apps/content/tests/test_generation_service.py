"""
Интеграционный тест GenerationService → запись в БД (шаг 1.7).

Нужен PostgreSQL/SQLite из settings; LLM мокаем через AI_LLM_ENABLED=False
или пустой ключ → template fallback без сети.
"""

from __future__ import annotations

import pytest

from apps.content.models import ContentMode, Generation, Persona
from apps.content.services.generation_service import GenerationService, GenerationServiceError
from apps.users.models import TelegramUser, UserSettings


@pytest.mark.django_db
class TestGenerationService:
    @pytest.fixture
    def user(self) -> TelegramUser:
        user, _ = TelegramUser.objects.get_or_create(
            telegram_id=900001,
            defaults={
                "username": "gen_tester",
                "first_name": "Gen",
                "language_code": "ru",
            },
        )
        UserSettings.objects.get_or_create(user=user, defaults={"locale": "ru"})
        return user

    @pytest.fixture
    def catalog(self) -> None:
        ContentMode.objects.update_or_create(
            slug="greeting",
            defaults={
                "name": "Поздравление",
                "emoji": "🎉",
                "phase": 1,
                "is_active": True,
                "sort_order": 10,
            },
        )
        Persona.objects.update_or_create(
            slug="bench-granny",
            defaults={
                "name": "Бабка с лавочки",
                "title": "пророчица",
                "category": "humor",
                "emoji": "👵",
                "voice_tone": "ворчливо",
                "signature": "Ой, дитятко…",
                "is_active": True,
                "sort_order": 20,
            },
        )

    def test_create_persists_result(self, user: TelegramUser, catalog: None, settings) -> None:
        settings.GROQ_API_KEY = ""
        settings.AI_LLM_ENABLED = True

        generation = GenerationService.create(
            user,
            {
                "content_mode": "greeting",
                "persona_id": "bench-granny",
                "name": "Александр",
                "event": "birthday",
            },
        )

        assert generation.status == Generation.Status.COMPLETED
        assert hasattr(generation, "result")
        assert "Александр" in generation.result.body_text
        assert generation.result.source == "template"
        assert Generation.objects.filter(pk=generation.pk).exists()

    def test_unknown_mode_raises(self, user: TelegramUser, catalog: None) -> None:
        with pytest.raises(GenerationServiceError):
            GenerationService.create(
                user,
                {
                    "content_mode": "no-such-mode",
                    "persona_id": "bench-granny",
                    "name": "Александр",
                },
            )
