"""
Unit-тесты HMAC initData (без сети и без Django Request).

Запуск:  python manage.py test apps.users
"""

from __future__ import annotations

import hashlib
import hmac
import json
import time
from urllib.parse import urlencode

from django.test import SimpleTestCase

from apps.users.telegram_auth import TelegramAuthError, verify_init_data


def _sign_init_data(fields: dict[str, str], bot_token: str) -> str:
    """Собирает валидный initData query-string для тестов."""
    data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(fields.items()))
    secret_key = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
    digest = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
    return urlencode({**fields, "hash": digest})


class VerifyInitDataTests(SimpleTestCase):
    """Проверка подписи и срока auth_date."""

    bot_token = "123456:ABC-DEF_test_token"

    def test_valid_init_data(self) -> None:
        user = {"id": 42, "first_name": "Ada", "username": "ada"}
        fields = {
            "auth_date": str(int(time.time())),
            "user": json.dumps(user, separators=(",", ":")),
        }
        init_data = _sign_init_data(fields, self.bot_token)
        verified = verify_init_data(init_data, self.bot_token)
        self.assertEqual(verified.user["id"], 42)
        self.assertEqual(verified.user["first_name"], "Ada")

    def test_invalid_hash(self) -> None:
        user = {"id": 1, "first_name": "X"}
        fields = {
            "auth_date": str(int(time.time())),
            "user": json.dumps(user, separators=(",", ":")),
        }
        init_data = _sign_init_data(fields, self.bot_token) + "dead"
        with self.assertRaises(TelegramAuthError):
            verify_init_data(init_data, self.bot_token)

    def test_expired_auth_date(self) -> None:
        user = {"id": 1, "first_name": "X"}
        fields = {
            "auth_date": str(int(time.time()) - 100_000),
            "user": json.dumps(user, separators=(",", ":")),
        }
        init_data = _sign_init_data(fields, self.bot_token)
        with self.assertRaises(TelegramAuthError):
            verify_init_data(init_data, self.bot_token, max_age_seconds=60)
