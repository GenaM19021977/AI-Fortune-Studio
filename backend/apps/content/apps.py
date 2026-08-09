"""
Приложение content — каталог режимов/персонажей и генерации (шаг 1.2).

Единый источник правды для Mini App: фронт не дублирует каталог,
а читает его через API (шаг 1.5).
"""

from django.apps import AppConfig


class ContentConfig(AppConfig):
    """Конфиг приложения: ContentMode, Persona, EventType, Generation*."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.content"
    verbose_name = "Контент и генерации"
