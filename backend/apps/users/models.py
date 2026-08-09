"""
Модели пользователей Mini App (шаг 1.1 DEVELOPMENT_GUIDE.md).

Источник правды по полям — IMPLEMENTATION_PLAN.md §6.1 (users).
Создаются/обновляются из Telegram initData на шаге 1.4 (auth).
"""

from __future__ import annotations

from django.db import models


class TelegramUser(models.Model):
    """
    Пользователь Telegram, пришедший через Mini App / бота.

    telegram_id — стабильный ключ из Telegram (не путать с pk Django).
    referrer — кто пригласил (рефералка, фаза 3); self-FK, может быть пустым.
    """

    # BigInteger: у Telegram id бывают > 2^31
    telegram_id = models.BigIntegerField(
        unique=True,
        db_index=True,
        help_text="Числовой id пользователя в Telegram (из initData).",
    )
    username = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="Telegram @username без @; может быть пустым.",
    )
    first_name = models.CharField(max_length=255, blank=True, default="")
    last_name = models.CharField(max_length=255, blank=True, default="")
    language_code = models.CharField(
        max_length=16,
        blank=True,
        default="ru",
        help_text="Код языка клиента Telegram (ru, en, …).",
    )
    is_premium = models.BooleanField(
        default=False,
        help_text="Telegram Premium у пользователя (из initDataUnsafe).",
    )
    # Self-FK: пригласивший уже должен существовать в нашей БД
    referrer = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="referrals",
        help_text="Кто привёл пользователя по реферальной ссылке (фаза 3).",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Пользователь Telegram"
        verbose_name_plural = "Пользователи Telegram"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        # Удобная подпись в админке и логах
        name = self.first_name or self.username or "user"
        return f"{name} ({self.telegram_id})"

    # --- DRF: IsAuthenticated смотрит на эти свойства у request.user ---
    @property
    def is_authenticated(self) -> bool:
        """Всегда True для загруженного TelegramUser (не AnonymousUser)."""
        return True

    @property
    def is_anonymous(self) -> bool:
        return False


class UserSettings(models.Model):
    """
    Настройки пользователя (1:1 к TelegramUser).

    favorite_persona — любимый персонаж из каталога (шаг 1.2).
    Создаём settings при первом /me или вручную в admin (шаг 1.4+).
    """

    user = models.OneToOneField(
        TelegramUser,
        on_delete=models.CASCADE,
        related_name="settings",
        help_text="Владелец настроек.",
    )
    favorite_persona = models.ForeignKey(
        "content.Persona",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="favorited_by_settings",
        help_text="Любимый персонаж пользователя (каталог content).",
    )
    locale = models.CharField(
        max_length=16,
        default="ru",
        help_text="Локаль UI/генерации (пока ru).",
    )
    notifications_enabled = models.BooleanField(
        default=True,
        help_text="Разрешены ли push/уведомления от бота.",
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Настройки пользователя"
        verbose_name_plural = "Настройки пользователей"

    def __str__(self) -> str:
        return f"settings:{self.user_id}"
