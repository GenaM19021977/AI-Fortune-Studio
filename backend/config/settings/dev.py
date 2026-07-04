"""
Настройки локальной разработки (localhost).

Активируется через .env:
    DJANGO_SETTINGS_MODULE=config.settings.dev
"""

from .base import *  # noqa: F403

DEBUG = env.bool("DEBUG", default=True)  # noqa: F405

ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

# Frontend Vite на шаге 0.5; пока разрешаем origin из .env
_cors_origins = env("CORS_ALLOWED_ORIGINS", default="http://localhost:5173")  # noqa: F405
CORS_ALLOWED_ORIGINS = [o.strip() for o in _cors_origins.split(",") if o.strip()]

# Удобная отладка SQL в консоли (при необходимости раскомментировать)
# LOGGING = { ... }
