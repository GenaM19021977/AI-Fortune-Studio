"""
QuotaService — проверка и списание дневного лимита (шаг 1.9).

Инкремент ДО вызова LLM: при лимите не тратим API-ключ впустую.
Атомарность: select_for_update внутри transaction.atomic.
"""

from __future__ import annotations

from dataclasses import dataclass

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from apps.billing.models import Subscription, UsageQuota
from apps.users.models import TelegramUser


class QuotaExceeded(Exception):
    """Дневной лимит исчерпан — view отдаёт HTTP 429."""

    def __init__(self, *, daily_limit: int, used: int) -> None:
        self.daily_limit = daily_limit
        self.used = used
        self.remaining = 0
        super().__init__(
            f"Дневной лимит исчерпан ({used}/{daily_limit})."
        )


@dataclass(frozen=True)
class QuotaSnapshot:
    """Снимок квоты для /me/ и ответов generate."""

    daily_limit: int
    used: int
    remaining: int


class QuotaService:
    """Лимиты free/premium и списание generations_count."""

    @staticmethod
    def get_daily_limit(user: TelegramUser) -> int:
        """Premium → PREMIUM_DAILY_LIMIT, иначе FREE_DAILY_LIMIT."""
        if QuotaService._is_premium(user):
            return int(getattr(settings, "PREMIUM_DAILY_LIMIT", 999))
        return int(getattr(settings, "FREE_DAILY_LIMIT", 5))

    @staticmethod
    def get_snapshot(user: TelegramUser) -> QuotaSnapshot:
        """Текущий расход за сегодня без изменения счётчика."""
        today = timezone.localdate()
        limit = QuotaService.get_daily_limit(user)
        try:
            quota = UsageQuota.objects.get(user=user, date=today)
            used = quota.generations_count
        except UsageQuota.DoesNotExist:
            used = 0
        return QuotaSnapshot(
            daily_limit=limit,
            used=used,
            remaining=max(limit - used, 0),
        )

    @staticmethod
    def get_remaining(user: TelegramUser) -> int:
        return QuotaService.get_snapshot(user).remaining

    @staticmethod
    def check_and_increment(user: TelegramUser) -> int:
        """
        Если лимит не достигнут — +1 к generations_count и вернуть remaining.
        Иначе — QuotaExceeded (remaining=0).

        Вызывать до LLM/fallback внутри GenerationService.create.
        """
        today = timezone.localdate()
        limit = QuotaService.get_daily_limit(user)

        with transaction.atomic():
            quota, _created = UsageQuota.objects.select_for_update().get_or_create(
                user=user,
                date=today,
                defaults={"generations_count": 0, "media_count": 0},
            )
            if quota.generations_count >= limit:
                raise QuotaExceeded(daily_limit=limit, used=quota.generations_count)

            # Инкремент до LLM — иначе при лимите всё равно дернули бы API
            quota.generations_count += 1
            quota.save(update_fields=["generations_count"])
            return max(limit - quota.generations_count, 0)

    @staticmethod
    def _is_premium(user: TelegramUser) -> bool:
        try:
            sub = user.subscription
        except Subscription.DoesNotExist:
            return False
        return sub.is_premium_active()
