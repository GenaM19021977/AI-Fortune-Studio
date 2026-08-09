"""
Тесты дневной квоты: 6-й запрос → QuotaExceeded / HTTP 429.
"""

from __future__ import annotations

import pytest
from django.test import override_settings
from rest_framework.test import APIClient

from apps.billing.models import UsageQuota
from apps.billing.services import QuotaExceeded, QuotaService
from apps.content.models import ContentMode, Persona
from apps.content.services.generation_service import GenerationService
from apps.users.models import TelegramUser, UserSettings


@pytest.mark.django_db
class TestQuotaService:
    @pytest.fixture
    def user(self) -> TelegramUser:
        user, _ = TelegramUser.objects.get_or_create(
            telegram_id=910009,
            defaults={"username": "quota_user", "first_name": "Q", "language_code": "ru"},
        )
        UserSettings.objects.get_or_create(user=user)
        return user

    @override_settings(FREE_DAILY_LIMIT=5, PREMIUM_DAILY_LIMIT=999)
    def test_sixth_increment_raises(self, user: TelegramUser) -> None:
        for _ in range(5):
            remaining = QuotaService.check_and_increment(user)
            assert remaining >= 0
        with pytest.raises(QuotaExceeded):
            QuotaService.check_and_increment(user)
        snap = QuotaService.get_snapshot(user)
        assert snap.used == 5
        assert snap.remaining == 0

    @override_settings(FREE_DAILY_LIMIT=2)
    def test_generate_http_429(self, user: TelegramUser) -> None:
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
                "sort_order": 1,
            },
        )

        client = APIClient()
        # force_authenticate — надёжнее, чем dev bypass в тестах
        client.force_authenticate(user=user)
        url = "/api/v1/generate/"
        payload = {
            "content_mode": "greeting",
            "persona_id": "bench-granny",
            "name": "Test",
            "event": "birthday",
        }

        r1 = client.post(url, payload, format="json")
        r2 = client.post(url, payload, format="json")
        r3 = client.post(url, payload, format="json")

        assert r1.status_code in (200, 201), r1.data
        assert r2.status_code in (200, 201), r2.data
        assert r3.status_code == 429, r3.data
        assert r3.data["quota_remaining"] == 0

        with pytest.raises(QuotaExceeded):
            GenerationService.create(user, payload)

        assert UsageQuota.objects.get(user=user).generations_count == 2
