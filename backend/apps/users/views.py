"""
API пользователя: me, settings, history, daily-fortune (шаги 1.4 / 1.10).
"""

from __future__ import annotations

from rest_framework import permissions, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.content.models import Generation
from apps.users.daily_fortune import get_daily_fortune
from apps.users.models import TelegramUser, UserSettings
from apps.users.serializers import (
    HistoryItemSerializer,
    MeSerializer,
    UserSettingsSerializer,
    UserSettingsUpdateSerializer,
)


def _require_telegram_user(request: Request) -> TelegramUser | Response:
    """Общая проверка: request.user должен быть TelegramUser."""
    user = request.user
    if not isinstance(user, TelegramUser):
        return Response({"detail": "Требуется Telegram-аутентификация."}, status=401)
    return user


class MeView(APIView):
    """GET /api/v1/me/ — профиль + квота."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request: Request) -> Response:
        user_or_err = _require_telegram_user(request)
        if isinstance(user_or_err, Response):
            return user_or_err
        user = user_or_err

        UserSettings.objects.get_or_create(user=user)
        user = TelegramUser.objects.select_related(
            "settings",
            "settings__favorite_persona",
        ).get(pk=user.pk)

        return Response(MeSerializer(user).data)


class MeSettingsView(APIView):
    """PATCH /api/v1/me/settings/ — locale, уведомления, любимый персонаж."""

    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request: Request) -> Response:
        user_or_err = _require_telegram_user(request)
        if isinstance(user_or_err, Response):
            return user_or_err
        user = user_or_err

        settings_obj, _ = UserSettings.objects.get_or_create(user=user)
        serializer = UserSettingsUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        settings_obj = serializer.update_settings(settings_obj)
        settings_obj = UserSettings.objects.select_related("favorite_persona").get(
            pk=settings_obj.pk
        )
        return Response(UserSettingsSerializer(settings_obj).data)


class HistoryPagination(PageNumberPagination):
    """Пагинация истории генераций."""

    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 50


class MeHistoryView(APIView):
    """
    GET /api/v1/me/history/?page=1 — история генераций пользователя.

    Только свои записи, свежие сверху.
    """

    permission_classes = [permissions.IsAuthenticated]
    pagination_class = HistoryPagination

    def get(self, request: Request) -> Response:
        user_or_err = _require_telegram_user(request)
        if isinstance(user_or_err, Response):
            return user_or_err
        user = user_or_err

        qs = (
            Generation.objects.filter(user=user)
            .select_related("content_mode", "persona", "result")
            .order_by("-created_at")
        )
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(qs, request, view=self)
        serializer = HistoryItemSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class DailyFortuneView(APIView):
    """
    GET /api/v1/daily-fortune/ — предсказание дня.

    Не тратит дневную квоту UsageQuota. Кэш на календарный день.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request: Request) -> Response:
        user_or_err = _require_telegram_user(request)
        if isinstance(user_or_err, Response):
            return user_or_err
        user = user_or_err

        UserSettings.objects.get_or_create(user=user)
        user = TelegramUser.objects.select_related("settings").get(pk=user.pk)
        return Response(get_daily_fortune(user), status=status.HTTP_200_OK)
