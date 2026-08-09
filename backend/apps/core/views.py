"""
Базовые API endpoints (health, позже — корневые служебные маршруты).
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([AllowAny])
def api_root(_request: Request) -> Response:
    """Корень API v1 — ссылки на доступные endpoints."""
    return Response({
        "service": "ai-fortune-studio",
        "version": "v1",
        "endpoints": {
            "health": "/api/v1/health/",
            "me": "/api/v1/me/",
            "modes": "/api/v1/modes/",
            "personas": "/api/v1/personas/",
            "events": "/api/v1/events/",
            "seasonal": "/api/v1/seasonal/",
            "schema": "/api/v1/schema/",
            "docs": "/api/v1/docs/",
        },
    })


@api_view(["GET"])
@permission_classes([AllowAny])
def health(_request: Request) -> Response:
    """
    Проверка доступности API.

    Используется при локальной разработке, Docker healthcheck (позже) и мониторинге.
  """
    return Response({"status": "ok", "service": "ai-fortune-studio"})
