"""
Read-only Catalog API (шаг 1.5 DEVELOPMENT_GUIDE.md).

Публичные списки для Mini App — без auth (AllowAny).
Источник данных — БД после `python manage.py seed_data`.
"""

from __future__ import annotations

from rest_framework import generics, permissions
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.content.models import ContentMode, EventType, Persona
from apps.content.serializers import (
    ContentModeSerializer,
    EventTypeSerializer,
    PersonaSerializer,
)
from apps.content.services import filter_seasonal_events


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
