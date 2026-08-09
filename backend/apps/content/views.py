"""
Read-only Catalog API (шаг 1.5) + генерация (шаг 1.8).

Каталог — AllowAny. Generate — IsAuthenticated (TMA / X-Dev-User-Id).
"""

from __future__ import annotations

from rest_framework import generics, permissions, status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.billing.services import QuotaExceeded, QuotaService
from apps.content.models import ContentMode, EventType, Generation, Persona
from apps.content.serializers import (
    ContentModeSerializer,
    EventTypeSerializer,
    GenerateRequestSerializer,
    PersonaSerializer,
    serialize_generation,
)
from apps.content.services import filter_seasonal_events
from apps.content.services.generation_service import GenerationService, GenerationServiceError
from apps.users.models import TelegramUser


class ModeListView(generics.ListAPIView):
    """
    GET /api/v1/modes/ — активные режимы контента.

    Query:
      ?phase=1 — только режимы указанной фазы roadmap.
    """

    permission_classes = [permissions.AllowAny]
    authentication_classes = []  # каталог не требует TMA / dev bypass
    serializer_class = ContentModeSerializer

    def get_queryset(self):
        qs = ContentMode.objects.filter(is_active=True).order_by("sort_order", "name")
        phase = self.request.query_params.get("phase")
        if phase is not None and phase != "":
            try:
                qs = qs.filter(phase=int(phase))
            except ValueError:
                # Некорректный phase → пустой список, без 500
                qs = qs.none()
        return qs


class PersonaListView(generics.ListAPIView):
    """
    GET /api/v1/personas/ — активные персонажи.

    Query:
      ?category=mystic|humor|sages|history — фильтр из плана §11.1.
    """

    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    serializer_class = PersonaSerializer

    def get_queryset(self):
        qs = Persona.objects.filter(is_active=True).order_by("sort_order", "name")
        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category=category)
        return qs


class EventListView(generics.ListAPIView):
    """GET /api/v1/events/ — все активные поводы (для мастера)."""

    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    serializer_class = EventTypeSerializer

    def get_queryset(self):
        return EventType.objects.filter(is_active=True).order_by("sort_order", "name")


class SeasonalEventListView(APIView):
    """
    GET /api/v1/seasonal/ — поводы «в сезоне» сегодня (баннер на главной).

    Без season_start/end события сюда не попадают (напр. birthday).
    """

    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def get(self, request: Request) -> Response:
        qs = filter_seasonal_events(EventType.objects.all())
        data = EventTypeSerializer(qs, many=True).data
        return Response(data)


class GenerateCreateView(APIView):
    """
    POST /api/v1/generate/ — синхронная текстовая генерация (шаг 1.8).

    Auth: Authorization: tma … или X-Dev-User-Id / ?dev_user_id= (DEBUG).
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request: Request) -> Response:
        user = request.user
        if not isinstance(user, TelegramUser):
            return Response({"detail": "Требуется Telegram-аутентификация."}, status=401)

        serializer = GenerateRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            generation = GenerationService.create(user, serializer.validated_data)
        except QuotaExceeded as exc:
            return Response(
                {
                    "detail": str(exc),
                    "quota_remaining": 0,
                    "daily_limit": exc.daily_limit,
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )
        except GenerationServiceError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        # Подтягиваем result + persona одним запросом для ответа
        generation = (
            Generation.objects.select_related("persona", "result", "content_mode")
            .get(pk=generation.pk)
        )
        payload = serialize_generation(
            generation,
            quota_remaining=QuotaService.get_remaining(user),
        )
        http_status = (
            status.HTTP_201_CREATED
            if generation.status == Generation.Status.COMPLETED
            else status.HTTP_200_OK
        )
        return Response(payload, status=http_status)


class GenerateDetailView(APIView):
    """
    GET /api/v1/generate/<uuid>/ — статус и результат (poll из плана §7.3).

    Только владелец генерации.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request: Request, generation_id) -> Response:
        user = request.user
        if not isinstance(user, TelegramUser):
            return Response({"detail": "Требуется Telegram-аутентификация."}, status=401)

        try:
            generation = Generation.objects.select_related(
                "persona",
                "result",
                "content_mode",
            ).get(pk=generation_id, user=user)
        except (Generation.DoesNotExist, ValueError, TypeError):
            return Response({"detail": "Генерация не найдена."}, status=404)

        return Response(
            serialize_generation(
                generation,
                quota_remaining=QuotaService.get_remaining(user),
            )
        )
