"""
Настройки локальной разработки (localhost).

Активируется через .env:
    DJANGO_SETTINGS_MODULE=config.settings.dev
"""

from .base import *  # noqa: F403

DEBUG = env.bool("DEBUG", default=True)  # noqa: F405

# Запросы к Django с телефона идут через Vite proxy (Host = localhost),
# поэтому сюда НЕ нужно добавлять домен ngrok/cloudflare.
ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

# Origins из .env. После шага 0.9 Start-Tunnel.ps1 дописывает HTTPS URL туннеля
# (на случай прямых запросов к API без Vite proxy).
_cors_origins = env("CORS_ALLOWED_ORIGINS", default="http://localhost:5173")  # noqa: F405
CORS_ALLOWED_ORIGINS = [o.strip() for o in _cors_origins.split(",") if o.strip()]

# SQLite — если Docker/PostgreSQL недоступен (USE_SQLITE=True в .env)
# Для полноценной разработки (фаза 1+) нужен PostgreSQL из docker compose.
if env.bool("USE_SQLITE", default=False):  # noqa: F405
    DATABASES = {  # noqa: F811
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",  # noqa: F405
        }
    }
