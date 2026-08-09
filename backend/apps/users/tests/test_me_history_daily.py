"""
Тесты me / history / daily-fortune (шаг 1.10).
"""

from __future__ import annotations

import pytest
from rest_framework.test import APIClient

from apps.content.models import ContentMode, Generation, GenerationResult, Persona
from apps.content.services.generation_service import GenerationService
from apps.users.models import TelegramUser, UserSettings


@pytest.mark.django_db
class TestMeHistoryDaily:
    @pytest.fixture
    def user(self) -> TelegramUser:
        user, _ = TelegramUser.objects.get_or_create(
            telegram_id=920020,
            defaults={
                "username": "hist_user",
                "first_name": "Hist",
                "language_code": "ru",
            },
        )
        UserSettings.objects.get_or_create(user=user, defaults={"locale": "ru"})
        return user

    @pytest.fixture
    def client(self, user: TelegramUser) -> APIClient:
        c = APIClient()
        c.force_authenticate(user=user)
        return c

    @pytest.fixture
    def catalog(self) -> None:
        ContentMode.objects.update_or_create(
            slug="greeting",
            defaults={"name": "Поздравление", "phase": 1, "is_active": True, "sort_order": 1},
        )
        Persona.objects.update_or_create(
            slug="bench-granny",
            defaults={
                "name": "Бабка с лавочки",
                "category": "humor",
                "is_active": True,
                "is_premium": False,
                "sort_order": 1,
                "signature": "Ой…",
            },
        )

    def test_me_ok(self, client: APIClient) -> None:
        r = client.get("/api/v1/me/")
        assert r.status_code == 200
        assert "quota" in r.data
        assert "settings" in r.data

    def test_patch_settings(self, client: APIClient, catalog: None) -> None:
        r = client.patch(
            "/api/v1/me/settings/",
            {"locale": "en", "favorite_persona_slug": "bench-granny"},
            format="json",
        )
        assert r.status_code == 200, r.data
        assert r.data["locale"] == "en"
        assert r.data["favorite_persona_slug"] == "bench-granny"

    def test_history_lists_generations(
        self, client: APIClient, user: TelegramUser, catalog: None, settings
    ) -> None:
        settings.GROQ_API_KEY = ""
        GenerationService.create(
            user,
            {
                "content_mode": "greeting",
                "persona_id": "bench-granny",
                "name": "Anna",
                "event": "birthday",
            },
        )
        r = client.get("/api/v1/me/history/")
        assert r.status_code == 200
        assert r.data["count"] >= 1
        assert r.data["results"][0]["content_mode"] == "greeting"
        assert "Anna" in r.data["results"][0]["body"] or r.data["results"][0]["title"]

    def test_daily_fortune_stable(
        self, client: APIClient, user: TelegramUser, catalog: None, settings
    ) -> None:
        settings.GROQ_API_KEY = ""
        before = Generation.objects.filter(user=user).count()
        r1 = client.get("/api/v1/daily-fortune/")
        r2 = client.get("/api/v1/daily-fortune/")
        assert r1.status_code == 200, r1.data
        assert r2.status_code == 200
        assert r1.data["date"] == r2.data["date"]
        assert r1.data["body"] == r2.data["body"]
        assert r1.data["persona_slug"]
        # Не создаёт Generation — квоту UsageQuota не трогаем через create
        assert Generation.objects.filter(user=user).count() == before
