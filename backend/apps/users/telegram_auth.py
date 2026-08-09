"""
Проверка подписи Telegram Mini App initData (шаг 1.4).

Алгоритм (документация Telegram Web Apps):
  1) разобрать query-string initData;
  2) убрать поле hash;
  3) собрать data-check-string: key=value по алфавиту, через \\n;
  4) secret_key = HMAC_SHA256(key=\"WebAppData\", msg=bot_token);
  5) calculated_hash = HMAC_SHA256(key=secret_key, msg=data-check-string);
  6) сравнить с hash; проверить auth_date (не старше max_age).

Зачем отдельно от DRF: чистая функция удобна для unit-тестов без Request.
"""

from __future__ import annotations

import hashlib
import hmac
import json
import time
from dataclasses import dataclass
from typing import Any
from urllib.parse import parse_qsl


class TelegramAuthError(Exception):
    """Невалидный / просроченный initData — маппится в HTTP 401 на уровне auth."""


@dataclass(frozen=True)
class VerifiedTelegramWebApp:
    """Результат успешной проверки: поля пользователя + служебные метаданные."""

    user: dict[str, Any]
    auth_date: int
    raw_fields: dict[str, str]


def verify_init_data(
    init_data: str,
    bot_token: str,
    *,
    max_age_seconds: int = 86_400,
) -> VerifiedTelegramWebApp:
    """
    Проверяет подпись initData и возвращает распарсенного пользователя.

    Raises:
        TelegramAuthError: нет hash/user, неверная подпись, просрочен auth_date.
    """
    if not init_data or not init_data.strip():
        raise TelegramAuthError("Пустой initData.")
    if not bot_token or bot_token.strip() == "your_bot_token_from_botfather":
        raise TelegramAuthError("BOT_TOKEN не задан на сервере.")

    # keep_blank_values: пустые поля (например start_param) тоже участвуют в подписи
    parsed = dict(parse_qsl(init_data, keep_blank_values=True))
    received_hash = parsed.pop("hash", None)
    if not received_hash:
        raise TelegramAuthError("В initData нет поля hash.")

    # data-check-string строго по спецификации Telegram
    data_check_string = "\n".join(f"{key}={value}" for key, value in sorted(parsed.items()))

    secret_key = hmac.new(
        key=b"WebAppData",
        msg=bot_token.encode("utf-8"),
        digestmod=hashlib.sha256,
    ).digest()
    calculated_hash = hmac.new(
        key=secret_key,
        msg=data_check_string.encode("utf-8"),
        digestmod=hashlib.sha256,
    ).hexdigest()

    # compare_digest — защита от timing-атак
    if not hmac.compare_digest(calculated_hash, received_hash):
        raise TelegramAuthError("Подпись initData не совпала.")

    try:
        auth_date = int(parsed.get("auth_date", "0"))
    except ValueError as exc:
        raise TelegramAuthError("Некорректный auth_date.") from exc

    if max_age_seconds > 0 and (time.time() - auth_date) > max_age_seconds:
        raise TelegramAuthError("initData устарел (auth_date).")

    user_raw = parsed.get("user")
    if not user_raw:
        raise TelegramAuthError("В initData нет поля user.")

    try:
        user = json.loads(user_raw)
    except json.JSONDecodeError as exc:
        raise TelegramAuthError("Поле user не является JSON.") from exc

    if not isinstance(user, dict) or "id" not in user:
        raise TelegramAuthError("В user отсутствует id.")

    return VerifiedTelegramWebApp(user=user, auth_date=auth_date, raw_fields=parsed)
