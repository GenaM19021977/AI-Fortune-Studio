"""
Сериализаторы профиля, настроек и истории (шаги 1.4 / 1.10).
"""

from __future__ import annotations

from django.core.exceptions import ObjectDoesNotExist
from rest_framework import serializers

from apps.content.models import Generation, Persona
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


class UserSettingsUpdateSerializer(serializers.Serializer):
    """
    PATCH /api/v1/me/settings/ — частичное обновление.

    favorite_persona_slug=null сбрасывает любимого персонажа.
    """

    locale = serializers.CharField(max_length=16, required=False)
    notifications_enabled = serializers.BooleanField(required=False)
    favorite_persona_slug = serializers.SlugField(
        max_length=64,
        required=False,
        allow_null=True,
        allow_blank=True,
    )

    def validate_favorite_persona_slug(self, value: str | None) -> str | None:
        if value in (None, ""):
            return None
        if not Persona.objects.filter(slug=value, is_active=True).exists():
            raise serializers.ValidationError("Неизвестный или неактивный персонаж.")
        return value

    def update_settings(self, settings_obj: UserSettings) -> UserSettings:
        data = self.validated_data
        if "locale" in data:
            settings_obj.locale = data["locale"]
        if "notifications_enabled" in data:
            settings_obj.notifications_enabled = data["notifications_enabled"]
        if "favorite_persona_slug" in data:
            slug = data["favorite_persona_slug"]
            if slug is None:
                settings_obj.favorite_persona = None
            else:
                settings_obj.favorite_persona = Persona.objects.get(slug=slug, is_active=True)
        settings_obj.save()
        return settings_obj


class MeSerializer(serializers.ModelSerializer):
    """Профиль текущего Mini App пользователя + квота."""

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
        from apps.billing.services import QuotaService

        snap = QuotaService.get_snapshot(obj)
        return {
            "daily_limit": snap.daily_limit,
            "used": snap.used,
            "remaining": snap.remaining,
        }


class HistoryItemSerializer(serializers.ModelSerializer):
    """Элемент GET /api/v1/me/history/."""

    content_mode = serializers.CharField(source="content_mode.slug", read_only=True)
    persona = serializers.CharField(source="persona.name", read_only=True)
    persona_slug = serializers.CharField(source="persona.slug", read_only=True)
    title = serializers.SerializerMethodField()
    body = serializers.SerializerMethodField()
    share_text = serializers.SerializerMethodField()
    source = serializers.SerializerMethodField()

    class Meta:
        model = Generation
        fields = (
            "id",
            "status",
            "content_mode",
            "persona",
            "persona_slug",
            "title",
            "body",
            "share_text",
            "source",
            "created_at",
        )

    def _result(self, obj: Generation):
        try:
            return obj.result
        except ObjectDoesNotExist:
            return None

    def get_title(self, obj: Generation) -> str:
        result = self._result(obj)
        return result.title if result else ""

    def get_body(self, obj: Generation) -> str:
        result = self._result(obj)
        return result.body_text if result else ""

    def get_share_text(self, obj: Generation) -> str:
        result = self._result(obj)
        return result.share_text if result else ""

    def get_source(self, obj: Generation) -> str | None:
        result = self._result(obj)
        return result.source if result else None
