"""
Общие настройки Django для AI Fortune Studio.

Используются и в dev, и (позже) в prod. Окружение выбирается через
DJANGO_SETTINGS_MODULE в .env: config.settings.dev
"""

from pathlib import Path

import environ

# Корень backend/: backend/
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Читаем переменные из backend/.env или корневого .env
env = environ.Env(
    DEBUG=(bool, False),
    ENABLE_DEV_AUTH=(bool, False),
)
environ.Env.read_env(BASE_DIR.parent / ".env")
environ.Env.read_env(BASE_DIR / ".env")

SECRET_KEY = env("SECRET_KEY", default="unsafe-dev-key-change-in-env")

# Приложения Django и сторонние пакеты
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # REST API
    "rest_framework",
    "corsheaders",
    "drf_spectacular",
    # Доменные приложения
    "apps.core",
    "apps.users.apps.UsersConfig",
    "apps.content.apps.ContentConfig",
    "apps.ai.apps.AiConfig",
    # "apps.billing",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

# База данных — URL из .env (PostgreSQL в Docker на шаге 0.2)
DATABASES = {
    "default": env.db("DATABASE_URL", default="postgres://fortune:fortune@localhost:5433/fortune"),
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "ru-ru"
TIME_ZONE = "Europe/Moscow"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"
# Локальные медиафайлы: backend/media/ (относительно BASE_DIR)
MEDIA_ROOT = BASE_DIR / env("MEDIA_ROOT", default="media")

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Redis — для Celery и кэша (подключим в фазе 2)
REDIS_URL = env("REDIS_URL", default="redis://localhost:6379/0")

# Telegram bot token — HMAC initData (шаг 1.4) и бот
BOT_TOKEN = env("BOT_TOKEN", default="")
# initData старше этого окна (сек) отклоняем; 24ч — как в плане §13.1
TELEGRAM_AUTH_MAX_AGE_SECONDS = env.int("TELEGRAM_AUTH_MAX_AGE_SECONDS", default=86_400)

# Дневной лимит free (заглушка в /me/ до apps.billing)
FREE_DAILY_LIMIT = env.int("FREE_DAILY_LIMIT", default=5)

# --- AI / LLM (шаг 1.6): без ключа работает шаблонный fallback ---
GROQ_API_KEY = env("GROQ_API_KEY", default="")
GROQ_MODEL = env("GROQ_MODEL", default="llama-3.3-70b-versatile")
GROQ_BASE_URL = env("GROQ_BASE_URL", default="https://api.groq.com/openai/v1")
LLM_TIMEOUT_SECONDS = env.int("LLM_TIMEOUT_SECONDS", default=15)
LLM_MAX_TOKENS = env.int("LLM_MAX_TOKENS", default=512)
# False — всегда шаблоны (удобно для CI без сети)
AI_LLM_ENABLED = env.bool("AI_LLM_ENABLED", default=True)

# --- Django REST Framework ---
REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    "DEFAULT_PARSER_CLASSES": [
        "rest_framework.parsers.JSONParser",
    ],
    # Порядок важен: сначала реальный TMA, потом локальный bypass
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "apps.users.authentication.TelegramInitDataAuthentication",
        "apps.users.authentication.DevBypassAuthentication",
    ],
    # По умолчанию нужен логин; health/каталог явно ставят AllowAny
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}

SPECTACULAR_SETTINGS = {
    "TITLE": "AI Fortune Studio API",
    "DESCRIPTION": "API для Telegram Mini App",
    "VERSION": "0.1.0",
}

# CORS — конкретные origins задаются в dev.py / prod.py
CORS_ALLOW_CREDENTIALS = True

# Флаг dev-обхода Telegram auth (только при DEBUG=True, шаг 1.4)
ENABLE_DEV_AUTH = env.bool("ENABLE_DEV_AUTH", default=False)