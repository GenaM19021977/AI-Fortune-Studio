"""
Сериализаторы профиля TelegramUser для /api/v1/me/.
"""

from __future__ import annotations

from rest_framework import serializers

from apps.users.models import TelegramUser, UserSettings


class UserSettingsSerializer(serializers.ModelSerializer):
    """Вложенные настройки; favorite отдаём slug для фронта."""

    favorite_persona_slug = serializers.SerializerMethodField()

    class Meta:
        model = UserSettings
        fields = (
            "locale",
            "notifications_enabled",
            "favorite_persona_slug",
        )

    def get_favorite_persona_slug(self, obj: UserSettings) -> str | None:
        if obj.favorite_persona_id is None:
            return None
        return obj.favorite_persona.slug


class MeSerializer(serializers.ModelSerializer):
    """
    Профиль текущего Mini App пользователя.

    quota — заглушка до apps.billing (шаг с UsageQuota); лимит из FREE_DAILY_LIMIT.
    """

    settings = UserSettingsSerializer(read_only=True)
    quota = serializers.SerializerMethodField()

    class Meta:
        model = TelegramUser
        fields = (
            "telegram_id",
            "username",
            "first_name",
            "last_name",
            "language_code",
            "is_premium",
            "settings",
            "quota",
            "created_at",
        )

    def get_quota(self, obj: TelegramUser) -> dict[str, int]:
        # Пока нет UsageQuota — всегда «полный» дневной лимит free
        from django.conf import settings

        daily_limit = int(getattr(settings, "FREE_DAILY_LIMIT", 5))
        used = 0
        return {
            "daily_limit": daily_limit,
            "used": used,
            "remaining": max(daily_limit - used, 0),
        }
