"""Маршруты API v1 — служебные endpoints."""

from django.urls import path

from apps.core import views

urlpatterns = [
    path("", views.api_root, name="api-root"),
    path("health/", views.health, name="health"),
]
