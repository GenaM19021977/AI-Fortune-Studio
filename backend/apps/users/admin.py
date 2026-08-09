"""
Админка пользователей Telegram (шаг 1.1).

Критерий готовности: модели видны на http://localhost:8000/admin/
и можно создать/посмотреть TelegramUser + UserSettings.
"""

from django.contrib import admin

from .models import TelegramUser, UserSettings


class UserSettingsInline(admin.StackedInline):
    """
    Настройки прямо на карточке пользователя — не нужно искать отдельную модель.
    max_num=1: OneToOne, больше одной записи быть не должно.
    """

    model = UserSettings
    can_delete = False
    max_num = 1
    extra = 0
    verbose_name_plural = "Настройки"


@admin.register(TelegramUser)
class TelegramUserAdmin(admin.ModelAdmin):
    """Список и карточка пользователей Mini App."""

    list_display = (
        "telegram_id",
        "username",
        "first_name",
        "last_name",
        "language_code",
        "is_premium",
        "referrer",
        "created_at",
    )
    list_filter = ("is_premium", "language_code", "created_at")
    search_fields = ("telegram_id", "username", "first_name", "last_name")
    readonly_fields = ("created_at", "updated_at")
    raw_id_fields = ("referrer",)
    inlines = (UserSettingsInline,)
    ordering = ("-created_at",)


@admin.register(UserSettings)
class UserSettingsAdmin(admin.ModelAdmin):
    """Отдельный список настроек (удобно для фильтрации по locale)."""

    list_display = (
        "user",
        "locale",
        "notifications_enabled",
        "favorite_persona",
        "updated_at",
    )
    list_filter = ("locale", "notifications_enabled")
    search_fields = ("user__telegram_id", "user__username", "user__first_name")
    raw_id_fields = ("user",)
    autocomplete_fields = ("favorite_persona",)
    readonly_fields = ("updated_at",)
