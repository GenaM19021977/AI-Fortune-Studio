"""
Сервисы users: синхронизация TelegramUser из initData / dev bypass.

Views и authentication остаются тонкими — вся запись в БД здесь.
"""

from __future__ import annotations

from typing import Any

from apps.users.models import TelegramUser, UserSettings


def upsert_telegram_user(telegram_user_payload: dict[str, Any]) -> TelegramUser:
    """
    Создаёт или обновляет TelegramUser по полям из initData.user.

    Также гарантирует наличие UserSettings (1:1) — нужно для /me/.
    """
    telegram_id = int(telegram_user_payload["id"])
    defaults = {
        "username": telegram_user_payload.get("username") or "",
        "first_name": telegram_user_payload.get("first_name") or "",
        "last_name": telegram_user_payload.get("last_name") or "",
        "language_code": telegram_user_payload.get("language_code") or "ru",
        "is_premium": bool(telegram_user_payload.get("is_premium", False)),
    }
    user, _created = TelegramUser.objects.update_or_create(
        telegram_id=telegram_id,
        defaults=defaults,
    )
    # Settings создаём лениво при первом успешном логине
    UserSettings.objects.get_or_create(user=user)
    return user


def get_or_create_dev_user(telegram_id: int) -> TelegramUser:
    """
    Dev bypass: пользователь для браузера/Postman без Telegram.

    telegram_id=1 совпадает с MOCK_TELEGRAM_USER на фронте (config/dev.ts).
    """
    user, _created = TelegramUser.objects.get_or_create(
        telegram_id=telegram_id,
        defaults={
            "username": "dev_tester",
            "first_name": "Тест",
            "last_name": "Разработчик",
            "language_code": "ru",
            "is_premium": False,
        },
    )
    UserSettings.objects.get_or_create(user=user)
    return user
