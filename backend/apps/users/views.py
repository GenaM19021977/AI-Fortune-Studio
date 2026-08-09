"""
API пользователей: /api/v1/me/ (шаг 1.4).
"""

from __future__ import annotations

from rest_framework import permissions
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.models import TelegramUser, UserSettings
from apps.users.serializers import MeSerializer


class MeView(APIView):
    """
    GET /api/v1/me/ — профиль текущего TelegramUser.

    Auth: Authorization: tma …  или  X-Dev-User-Id (только DEBUG).
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request: Request) -> Response:
        user = request.user
        # Защита: сюда не должен попасть django User из session admin
        if not isinstance(user, TelegramUser):
            return Response({"detail": "Требуется Telegram-аутентификация."}, status=401)

        # settings мог отсутствовать у старых записей — подстрахуемся
        UserSettings.objects.get_or_create(user=user)
        user = TelegramUser.objects.select_related(
            "settings",
            "settings__favorite_persona",
        ).get(pk=user.pk)

        serializer = MeSerializer(user)
        return Response(serializer.data)
