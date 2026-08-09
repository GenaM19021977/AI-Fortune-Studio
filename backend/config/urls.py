"""
Корневые URL-маршруты проекта.

Префикс API: /api/v1/
"""

from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.permissions import AllowAny

# OpenAPI без Telegram-auth — иначе Swagger на localhost недоступен
_schema_kwargs = {
    "authentication_classes": [],
    "permission_classes": [AllowAny],
}

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include("apps.core.urls")),
    path("api/v1/", include("apps.users.urls")),
    path("api/v1/", include("apps.content.urls")),
    path("api/v1/schema/", SpectacularAPIView.as_view(**_schema_kwargs), name="schema"),
    path(
        "api/v1/docs/",
        SpectacularSwaggerView.as_view(url_name="schema", **_schema_kwargs),
        name="docs",
    ),
    # Алиас как в DEVELOPMENT_GUIDE (swagger-ui)
    path(
        "api/v1/schema/swagger-ui/",
        SpectacularSwaggerView.as_view(url_name="schema", **_schema_kwargs),
        name="swagger-ui",
    ),
]
