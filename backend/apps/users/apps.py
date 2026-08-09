"""
Приложение users — пользователи Telegram Mini App (шаг 1.1).

Не путать с django.contrib.auth.User:
  - User — только для Django Admin / createsuperuser;
  - TelegramUser — реальные клиенты из Telegram initData (шаг 1.4).
"""

from django.apps import AppConfig


class UsersConfig(AppConfig):
    """Конфиг приложения: модели TelegramUser и UserSettings."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.users"
    # Подпись в админке слева
    verbose_name = "Пользователи Telegram"
