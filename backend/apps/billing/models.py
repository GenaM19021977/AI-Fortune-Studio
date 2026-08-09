"""
Модели биллинга (IMPLEMENTATION_PLAN §6.1 billing).

UsageQuota — дневной счётчик; Subscription — premium (фаза 3 оплата Stars).
"""

from __future__ import annotations

from django.db import models
from django.utils import timezone


class Subscription(models.Model):
    """
    Подписка пользователя.

    Пока создаём/правим вручную в admin; оплата Stars — позже.
    """

    class Plan(models.TextChoices):
        FREE = "free", "Free"
        PREMIUM = "premium", "Premium"

    user = models.OneToOneField(
        "users.TelegramUser",
        on_delete=models.CASCADE,
        related_name="subscription",
        help_text="Владелец подписки.",
    )
    plan = models.CharField(
        max_length=16,
        choices=Plan.choices,
        default=Plan.FREE,
    )
    expires_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Null для free; для premium — дата окончания.",
    )
    telegram_payment_id = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="Id платежа Telegram Stars (фаза 3).",
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Подписка"
        verbose_name_plural = "Подписки"

    def __str__(self) -> str:
        return f"{self.user_id}:{self.plan}"

    def is_premium_active(self) -> bool:
        """Premium действует, если план premium и срок не истёк."""
        if self.plan != self.Plan.PREMIUM:
            return False
        if self.expires_at is None:
            return False
        return self.expires_at > timezone.now()


class UsageQuota(models.Model):
    """
    Дневной расход генераций/медиа на пользователя.

    Уникальность (user, date) — одна строка на календарный день (TIME_ZONE Django).
    """

    user = models.ForeignKey(
        "users.TelegramUser",
        on_delete=models.CASCADE,
        related_name="usage_quotas",
    )
    date = models.DateField(db_index=True, help_text="Локальная дата учёта.")
    generations_count = models.PositiveIntegerField(
        default=0,
        help_text="Сколько текстовых генераций уже сделано сегодня.",
    )
    media_count = models.PositiveIntegerField(
        default=0,
        help_text="Сколько медиа-запросов (фаза 2).",
    )

    class Meta:
        verbose_name = "Дневная квота"
        verbose_name_plural = "Дневные квоты"
        constraints = [
            models.UniqueConstraint(
                fields=["user", "date"],
                name="billing_usagequota_user_date_uniq",
            ),
        ]
        ordering = ["-date"]

    def __str__(self) -> str:
        return f"{self.user_id}@{self.date}: gen={self.generations_count}"
