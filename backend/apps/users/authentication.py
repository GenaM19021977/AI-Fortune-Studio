"""
DRF authentication classes (шаг 1.4 DEVELOPMENT_GUIDE.md).

Порядок в DEFAULT_AUTHENTICATION_CLASSES:
  1) TelegramInitDataAuthentication — заголовок Authorization: tma <initData>
  2) DevBypassAuthentication — только DEBUG + ENABLE_DEV_AUTH + X-Dev-User-Id

request.user после успеха — экземпляр TelegramUser (не django.contrib.auth.User).
"""

from __future__ import annotations

import logging

from django.conf import settings
from rest_framework import authentication, exceptions
from rest_framework.request import Request

from apps.users.services import get_or_create_dev_user, upsert_telegram_user
from apps.users.telegram_auth import TelegramAuthError, verify_init_data

logger = logging.getLogger(__name__)

DEV_USER_HEADER = "HTTP_X_DEV_USER_ID"


class TelegramInitDataAuthentication(authentication.BaseAuthentication):
    """
    Проверяет Authorization: tma <initData> и возвращает (TelegramUser, None).

    Если заголовка нет — возвращаем None, чтобы сработала следующая auth-class
    (dev bypass). Если заголовок есть, но подпись битая — 401.
    """

    www_authenticate_realm = "telegram"

    def authenticate(self, request: Request) -> tuple[object, None] | None:
        auth_header = authentication.get_authorization_header(request).decode("utf-8").strip()
        if not auth_header:
            return None

        scheme, _, remainder = auth_header.partition(" ")
        if scheme.lower() != "tma":
            # Bearer и др. — пропускаем к следующей auth-class / Anonymous
            return None
        if not remainder.strip():
            raise exceptions.AuthenticationFailed(
                "Ожидается заголовок Authorization: tma <initData>."
            )

        init_data = remainder.strip()
        bot_token = getattr(settings, "BOT_TOKEN", "") or ""
        max_age = int(getattr(settings, "TELEGRAM_AUTH_MAX_AGE_SECONDS", 86_400))

        try:
            verified = verify_init_data(init_data, bot_token, max_age_seconds=max_age)
        except TelegramAuthError as exc:
            logger.info("Telegram initData отклонён: %s", exc)
            raise exceptions.AuthenticationFailed(str(exc)) from exc

        user = upsert_telegram_user(verified.user)
        return (user, None)

    def authenticate_header(self, request: Request) -> str:
        # Чтобы DRF отдал WWW-Authenticate при 401
        return f'TMA realm="{self.www_authenticate_realm}"'


class DevBypassAuthentication(authentication.BaseAuthentication):
    """
    Локальный обход для браузера без Telegram WebApp.

    Условия (все обязательны):
      - settings.DEBUG is True
      - settings.ENABLE_DEV_AUTH is True
      - telegram_id из одного из источников:
          • заголовок X-Dev-User-Id
          • query ?dev_user_id=1  (удобно в Postman, если header «теряется»)

    В production (Фаза 5) DEBUG=False → класс всегда молчит (return None).
    """

    def authenticate(self, request: Request) -> tuple[object, None] | None:
        if not settings.DEBUG:
            return None
        if not getattr(settings, "ENABLE_DEV_AUTH", False):
            return None

        raw_id = self._extract_dev_user_id(request)
        if raw_id is None or raw_id == "":
            return None

        try:
            telegram_id = int(str(raw_id).strip())
        except (TypeError, ValueError) as exc:
            raise exceptions.AuthenticationFailed(
                "X-Dev-User-Id / dev_user_id должен быть целым числом (telegram_id)."
            ) from exc

        if telegram_id <= 0:
            raise exceptions.AuthenticationFailed("dev user id должен быть > 0.")

        user = get_or_create_dev_user(telegram_id)
        return (user, None)

    @staticmethod
    def _extract_dev_user_id(request: Request) -> str | None:
        """
        Достаём id из заголовка или query.

        request.headers — case-insensitive (надёжнее, чем только META).
        Query — запасной путь для Postman: /api/v1/me/?dev_user_id=1
        """
        # 1) Нормальный способ (Django 2.2+ / DRF Request)
        header_value = request.headers.get("X-Dev-User-Id")
        if header_value not in (None, ""):
            return header_value

        # 2) Явный META (если прокси переписал регистр необычно)
        meta_value = request.META.get(DEV_USER_HEADER)
        if meta_value not in (None, ""):
            return meta_value

        # 3) Postman-friendly query param (только при уже проверенном DEBUG)
        query_value = request.query_params.get("dev_user_id")
        if query_value not in (None, ""):
            return query_value

        return None
