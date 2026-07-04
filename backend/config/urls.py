"""
Корневые URL-маршруты проекта.

API v1 и health endpoint — шаг 0.4.
"""

from django.contrib import admin
from django.urls import path

urlpatterns = [
    path("admin/", admin.site.urls),
]
