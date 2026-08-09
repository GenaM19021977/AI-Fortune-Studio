"""
Приложение ai — LLM, промпты, fallback (без своих Django-моделей).

Генерации хранятся в apps.content; здесь только «как получить текст».
"""

from django.apps import AppConfig


class AiConfig(AppConfig):
    """Конфиг AI-слоя: Groq + шаблонный fallback."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.ai"
    verbose_name = "AI-генерация"
