# AI Fortune Studio — Детальный план реализации

**Версия:** 1.0  
**Дата:** 3 июля 2026  
**Статус:** Планирование (код не начат)

---

## Содержание

1. [Обзор проекта](#1-обзор-проекта)
2. [Архитектура системы](#2-архитектура-системы)
3. [Технологический стек](#3-технологический-стек)
4. [Структура репозитория](#4-структура-репозитория)
5. [Инфраструктура и окружения](#5-инфраструктура-и-окружения)
6. [Модель данных](#6-модель-данных)
7. [Backend API (Django REST Framework)](#7-backend-api-django-rest-framework)
8. [Telegram Bot (aiogram 3)](#8-telegram-bot-aiogram-3)
9. [Frontend Mini App (React + TypeScript)](#9-frontend-mini-app-react--typescript)
10. [AI-пайплайн и генерация контента](#10-ai-пайплайн-и-генерация-контента)
11. [Персонажи и промпт-инженерия](#11-персонажи-и-промпт-инженерия)
12. [Очереди, кэш и долгие задачи](#12-очереди-кэш-и-долгие-задачи)
13. [Авторизация и безопасность](#13-авторизация-и-безопасность)
14. [Монетизация и лимиты](#14-монетизация-и-лимиты)
15. [Социальные и вирусные механики](#15-социальные-и-вирусные-механики)
16. [Поэтапный Roadmap](#16-поэтапный-roadmap)
17. [Тестирование](#17-тестирование)
18. [Деплой и CI/CD](#18-деплой-и-cicd)
19. [Риски и митигация](#19-риски-и-митигация)
20. [Критерии готовности по фазам](#20-критерии-готовности-по-фазам)

---

## 1. Обзор проекта

### 1.1. Идея

**AI Fortune Studio** — Telegram Mini App для мобильных устройств, генерирующий персонализированный развлекательный контент: поздравления, гороскопы, предсказания, стихи, песни, тосты, таро, мемы, roast и др.

Ключевое отличие от простых «генераторов текста» — **персонажи** с уникальным голосом (Бабка с лавочки, Нострадамус, Таро-критик, Одесский юмор, Дворецкий и др.).

### 1.2. Целевая аудитория

| Сегмент | Возраст | Поведение |
|---------|---------|-----------|
| Основная | 18–35 | Telegram, мемы, TikTok, Reels, шеринг |
| Вторичная | 35–60 | Поздравления родственникам, корпоративы |
| Дополнительная | 60+ | Простой интерфейс, голосовые, крупные кнопки |

### 1.3. Пользовательский цикл

```
Telegram Bot (/start)
    → Кнопка «Открыть студию»
        → Mini App: Главная
            → Выбор режима контента
                → Ввод данных (имя, дата, повод…)
                    → Выбор персонажа / стиля
                        → Генерация (текст / медиа)
                            → Результат + шеринг / избранное / регенерация
```

### 1.4. Роли компонентов

| Компонент | Роль |
|-----------|------|
| **aiogram 3** | Точка входа, открытие Mini App, уведомления, рефералки, оплата Stars |
| **DRF (Django REST)** | Бизнес-логика, API, авторизация, история, лимиты, AI-оркестрация |
| **React Mini App** | Полноценный мобильный UI внутри Telegram |
| **Celery** | Фоновая генерация картинок, аудио, видео |
| **PostgreSQL** | Постоянное хранение |
| **Redis** | Кэш, брокер Celery, rate limiting |

---

## 2. Архитектура системы

### 2.1. Диаграмма

```
┌─────────────────────────────────────────────────────────────────┐
│                     Telegram Client (Mobile)                     │
│  ┌──────────────┐              ┌──────────────────────────────┐ │
│  │  Bot Chat    │──WebApp─────▶│  Mini App (React + TS)       │ │
│  │  (aiogram)   │              │  Tailwind, TWA SDK           │ │
│  └──────┬───────┘              └──────────────┬───────────────┘ │
└─────────┼─────────────────────────────────────┼─────────────────┘
          │                                     │ HTTPS /api
          ▼                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Nginx (reverse proxy)                    │
│              /api/* → DRF          /* → React static             │
└─────────────────────────────┬───────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
   │  DRF API    │    │   Celery    │    │   Redis     │
   │  Django 5   │    │   Workers   │    │   Cache     │
   └──────┬──────┘    └──────┬──────┘    └─────────────┘
          │                  │
          ▼                  ▼
   ┌─────────────┐    ┌─────────────────────────────┐
   │ PostgreSQL  │    │  AI Providers / Local Models │
   └─────────────┘    │  Groq, HF, edge-tts, FFmpeg  │
                      └─────────────────────────────┘
```

### 2.2. Принципы

- **API-first:** Mini App и Bot работают с одним DRF API.
- **Async generation:** текст — синхронно (до 5 сек), медиа — через job + polling/WebSocket.
- **Единый источник правды:** персонажи, режимы, лимиты — в Django, не дублировать на фронте.
- **Graceful degradation:** при недоступности LLM — шаблонный fallback, пользователь не видит ошибку.

---

## 3. Технологический стек

### 3.1. Backend

| Технология | Версия | Назначение |
|------------|--------|------------|
| Python | 3.12+ | Основной язык |
| Django | 5.x | Фреймворк, ORM, админка |
| Django REST Framework | 3.15+ | REST API |
| drf-spectacular | latest | OpenAPI / Swagger документация |
| django-cors-headers | latest | CORS для Mini App |
| django-environ | latest | Конфигурация из `.env` |
| psycopg2-binary / asyncpg | latest | PostgreSQL драйвер |
| Celery | 5.x | Фоновые задачи |
| Redis | 7.x | Брокер + кэш |
| httpx | latest | HTTP-клиент к AI API |
| openai | latest | OpenAI-compatible клиент (Groq, Together, Ollama) |
| huggingface_hub | latest | HF Inference |
| Jinja2 | latest | Шаблоны промптов |
| Pillow | latest | Обработка изображений |
| edge-tts | latest | Бесплатная озвучка |
| moviepy | latest | Сборка видео |
| gunicorn | latest | WSGI production |
| whitenoise | latest | Статика Django (админка) |

### 3.2. Telegram Bot

| Технология | Назначение |
|------------|------------|
| aiogram | 3.x | Async Bot API |
| aiohttp | HTTP к DRF API при необходимости |

### 3.3. Frontend

| Технология | Назначение |
|------------|------------|
| React | 18+ | UI |
| TypeScript | 5.x | Типизация |
| Vite | 6.x | Сборка |
| Tailwind CSS | 4.x | Стили |
| @twa-dev/sdk | Telegram WebApp API |
| React Router | 7.x | Навигация |
| TanStack Query | 5.x | Кэш API, polling jobs |
| Zustand | 5.x | Локальный state (мастер создания) |
| framer-motion | Анимации |
| lucide-react | Иконки |

### 3.4. Инфраструктура

| Технология | Назначение |
|------------|------------|
| Docker + docker-compose | Локальная разработка и деплой |
| Nginx | Reverse proxy, SSL, static |
| GitHub Actions | CI/CD |
| Sentry | Мониторинг ошибок |
| Let's Encrypt / Certbot | SSL |

### 3.5. AI-модели (бесплатные / open-source)

| Тип | Модели | Подключение |
|-----|--------|-------------|
| Текст | Qwen 3, Llama 3.3, Gemma 3, Mistral Small | Groq API (free tier), Ollama (fallback) |
| Картинки | SDXL, FLUX.1-dev, Juggernaut XL | HF Inference, Pollinations (MVP), ComfyUI (prod) |
| Музыка | MusicGen, ACE-Step, Stable Audio Open | Локально через Celery worker с GPU |
| Голос | Piper TTS, Kokoro, edge-tts | edge-tts (старт), Piper (сервер) |
| Видео | Wan 2.1, CogVideoX | Фаза 4; до этого FFmpeg + MoviePy |
| STT | Whisper Large v3 | Локально / HF (голосовой ввод) |
| OCR | PaddleOCR | Загрузка фото открыток (фаза 3) |
| Монтаж | FFmpeg + MoviePy | Сборка Stories/Reels |

---

## 4. Структура репозитория

```
AI-Fortune-Studio/
├── IMPLEMENTATION_PLAN.md          # этот документ
├── README.md
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
├── .gitignore
│
├── backend/                        # Django + DRF
│   ├── manage.py
│   ├── requirements/
│   │   ├── base.txt
│   │   ├── dev.txt
│   │   └── prod.txt
│   ├── config/                     # Django settings
│   │   ├── settings/
│   │   │   ├── base.py
│   │   │   ├── dev.py
│   │   │   └── prod.py
│   │   ├── urls.py
│   │   ├── celery.py
│   │   └── wsgi.py
│   └── apps/
│       ├── users/                  # Telegram-пользователи
│       ├── content/                # Режимы, персонажи, генерации
│       ├── billing/                # Лимиты, подписки, Stars
│       ├── social/                 # Рефералки, рейтинги, шеринг
│       └── ai/                     # LLM, image, tts, video сервисы
│
├── bot/                            # aiogram 3
│   ├── requirements.txt
│   ├── main.py
│   ├── config.py
│   ├── handlers/
│   │   ├── start.py
│   │   ├── notifications.py
│   │   └── payments.py
│   ├── keyboards/
│   └── middlewares/
│
├── frontend/                       # React Mini App
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── index.html
│   ├── public/
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── api/                    # клиент DRF
│       ├── hooks/                  # useTelegram, useAuth
│       ├── store/                  # Zustand
│       ├── pages/
│       ├── components/
│       ├── types/
│       └── styles/
│
├── workers/                        # Celery tasks (или в backend/apps/ai/tasks.py)
│
├── nginx/
│   ├── nginx.conf
│   └── ssl/
│
├── scripts/
│   ├── init_db.sh
│   └── seed_personas.py
│
└── .github/
    └── workflows/
        ├── backend-ci.yml
        ├── frontend-ci.yml
        └── deploy.yml
```

---

## 5. Инфраструктура и окружения

### 5.1. Сервисы docker-compose (dev)

| Сервис | Порт | Описание |
|--------|------|----------|
| `db` | 5432 | PostgreSQL 16 |
| `redis` | 6379 | Redis 7 |
| `api` | 8000 | Django + Gunicorn |
| `celery` | — | Celery worker |
| `celery-beat` | — | Периодические задачи (сезоны, daily) |
| `bot` | — | aiogram polling / webhook |
| `frontend` | 5173 | Vite dev server |
| `nginx` | 80/443 | Прокси (prod) |

### 5.2. Переменные окружения (.env.example)

```env
# Django
SECRET_KEY=
DEBUG=False
ALLOWED_HOSTS=api.example.com
DATABASE_URL=postgres://user:pass@db:5432/fortune

# Telegram
BOT_TOKEN=
WEBAPP_URL=https://app.example.com
TELEGRAM_WEBHOOK_URL=          # prod only

# Redis / Celery
REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/1

# AI
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
OLLAMA_BASE_URL=http://host.docker.internal:11434
HF_API_TOKEN=
AI_FALLBACK_ENABLED=True

# Storage (фаза 2+)
AWS_S3_BUCKET=                   # или MinIO локально
CDN_BASE_URL=

# Sentry
SENTRY_DSN=

# Billing
FREE_DAILY_LIMIT=5
PREMIUM_DAILY_LIMIT=999
```

### 5.3. Окружения

| Окружение | Назначение |
|-----------|------------|
| `local` | Docker compose, hot reload, SQLite опционально |
| `staging` | Полный стек, тестовый бот |
| `production` | HTTPS, webhook, Sentry, бэкапы БД |

---

## 6. Модель данных

### 6.1. Django Apps и модели

#### `users`

| Модель | Поля | Описание |
|--------|------|----------|
| `TelegramUser` | `telegram_id`, `username`, `first_name`, `last_name`, `language_code`, `is_premium`, `referrer_id`, `created_at` | Пользователь из initData |
| `UserSettings` | `user`, `favorite_persona_id`, `locale`, `notifications_enabled` | Настройки |

#### `content`

| Модель | Поля | Описание |
|--------|------|----------|
| `ContentMode` | `slug`, `name`, `emoji`, `description`, `phase`, `is_active`, `sort_order` | Режимы (greeting, horoscope…) |
| `Persona` | `slug`, `name`, `title`, `category`, `emoji`, `gradient`, `voice_tone`, `signature`, `system_prompt`, `is_premium`, `is_active` | Персонажи |
| `EventType` | `slug`, `name`, `emoji`, `season_start`, `season_end` | Поводы (ДР, свадьба…) |
| `Generation` | `user`, `content_mode`, `persona`, `input_data` (JSON), `status`, `created_at` | Запрос генерации |
| `GenerationResult` | `generation`, `title`, `body_text`, `share_text`, `source` (llm/template) | Текстовый результат |
| `MediaAsset` | `generation`, `media_type` (image/audio/video), `file`, `url`, `status` | Медиафайлы |
| `Favorite` | `user`, `generation` | Избранное |

#### `billing`

| Модель | Поля | Описание |
|--------|------|----------|
| `Subscription` | `user`, `plan`, `expires_at`, `telegram_payment_id` | Подписка |
| `UsageQuota` | `user`, `date`, `generations_count`, `media_count` | Дневные лимиты |

#### `social`

| Модель | Поля | Описание |
|--------|------|----------|
| `Referral` | `referrer`, `referred`, `bonus_granted` | Рефералы |
| `Rating` | `generation`, `user`, `score` (+1/-1) | Оценка результата |
| `ShareEvent` | `generation`, `user`, `channel` | Аналитика шеринга |

### 6.2. Статусы Generation

```
pending → processing → completed
                    → failed
```

### 6.3. input_data (JSON) — структура

```json
{
  "name": "Александр",
  "birth_date": "1990-05-15",
  "event": "birthday",
  "partner_name": null,
  "extra": "любит рыбалку"
}
```

---

## 7. Backend API (Django REST Framework)

### 7.1. Аутентификация

- Mini App передаёт заголовок `Authorization: tma <initData>`.
- DRF authentication class `TelegramInitDataAuthentication`:
  - Парсинг `initData`.
  - HMAC-SHA256 проверка через `BOT_TOKEN`.
  - Создание/обновление `TelegramUser`.
- Для админки — стандартная Django session auth.

### 7.2. Endpoints

#### Публичные / каталог

| Method | Path | Описание |
|--------|------|----------|
| GET | `/api/v1/health/` | Health check |
| GET | `/api/v1/modes/` | Список режимов контента |
| GET | `/api/v1/personas/` | Персонажи (`?category=mystic`) |
| GET | `/api/v1/events/` | Типы поводов |
| GET | `/api/v1/seasonal/` | Активные сезонные события |

#### Генерация

| Method | Path | Описание |
|--------|------|----------|
| POST | `/api/v1/generate/` | Создать генерацию |
| GET | `/api/v1/generate/{id}/` | Статус + результат |
| POST | `/api/v1/generate/{id}/regenerate/` | Повтор с теми же параметрами |
| POST | `/api/v1/generate/{id}/media/` | Запросить медиа (image/audio/video) |

#### Пользователь

| Method | Path | Описание |
|--------|------|----------|
| GET | `/api/v1/me/` | Профиль + лимиты |
| PATCH | `/api/v1/me/settings/` | Настройки |
| GET | `/api/v1/me/history/` | История (`?page=`) |
| GET | `/api/v1/me/favorites/` | Избранное |
| POST | `/api/v1/me/favorites/{gen_id}/` | Добавить в избранное |
| DELETE | `/api/v1/me/favorites/{gen_id}/` | Удалить |

#### Социальное

| Method | Path | Описание |
|--------|------|----------|
| GET | `/api/v1/daily-fortune/` | Предсказание дня |
| POST | `/api/v1/rate/{gen_id}/` | Оценка (+1/-1) |
| POST | `/api/v1/share/{gen_id}/` | Лог шеринга |
| GET | `/api/v1/referral/` | Реферальная ссылка + статистика |

#### Billing

| Method | Path | Описание |
|--------|------|----------|
| GET | `/api/v1/billing/plans/` | Тарифы |
| GET | `/api/v1/billing/usage/` | Использование за сегодня |

### 7.3. POST `/api/v1/generate/` — контракт

**Request:**
```json
{
  "content_mode": "greeting",
  "persona_id": "bench-granny",
  "name": "Александр",
  "event": "birthday",
  "birth_date": "1990-05-15",
  "partner_name": null,
  "extra": "любит котиков"
}
```

**Response (текст — сразу):**
```json
{
  "id": "uuid",
  "status": "completed",
  "result": {
    "title": "Поздравление для Александра",
    "body": "...",
    "share_text": "...",
    "persona": "Бабка с лавочки",
    "source": "llm"
  },
  "quota_remaining": 4
}
```

**Response (медиа — async):**
```json
{
  "id": "uuid",
  "status": "processing",
  "job_id": "celery-task-id",
  "poll_url": "/api/v1/generate/uuid/"
}
```

### 7.4. DRF структура по apps

```
apps/content/
├── models.py
├── serializers.py
├── views.py
├── urls.py
├── permissions.py          # IsAuthenticated via Telegram
├── throttling.py           # UserRateThrottle по тарифу
└── services/
    └── generation_service.py

apps/ai/
├── services/
│   ├── llm.py              # Groq / Ollama
│   ├── image.py
│   ├── tts.py
│   ├── video.py
│   └── fallback.py         # Шаблоны
├── prompts/                # Jinja2
│   ├── greeting.j2
│   ├── horoscope.j2
│   └── base_persona.j2
└── tasks.py                # Celery
```

### 7.5. Django Admin

- Управление персонажами, режимами, сезонными событиями.
- Просмотр генераций, рейтингов, ошибок.
- Ручной бан пользователей.

---

## 8. Telegram Bot (aiogram 3)

### 8.1. Задачи бота

Бот **не** ведёт основной диалог генерации — только:

1. Приветствие и кнопка открытия Mini App.
2. Уведомления о готовности долгих генераций.
3. Реферальные deep links (`?start=ref_12345`).
4. Оплата Telegram Stars (премиум).
5. Fallback-команды для пользователей без Mini App.

### 8.2. Команды

| Команда | Действие |
|---------|----------|
| `/start` | Приветствие + `WebAppInfo` кнопка «✨ Открыть студию» |
| `/start ref_<id>` | Регистрация реферала + открытие App |
| `/daily` | Inline-кнопка → открыть App на экране daily fortune |
| `/premium` | Информация о подписке + оплата Stars |
| `/help` | Краткая справка |

### 8.3. Клавиатуры

**Reply (постоянная):**
```
[ ✨ Открыть AI Fortune Studio ]
```

**Inline (при уведомлении):**
```
[ 📖 Открыть результат ]  [ 📤 Поделиться ]
```

### 8.4. Webhook vs Polling

| Режим | Когда |
|-------|-------|
| Polling | Локальная разработка |
| Webhook | Production (`/bot/webhook/`) |

### 8.5. Уведомления от Celery → Bot

1. Celery task завершает генерацию медиа.
2. Task вызывает внутренний API или напрямую Bot API.
3. Пользователю: «🎵 Ваша песня готова!» + кнопка открыть Mini App с `?generation_id=uuid`.

### 8.6. Структура bot/

```
bot/
├── main.py                 # Dispatcher, startup
├── config.py               # pydantic-settings
├── handlers/
│   ├── start.py
│   ├── referral.py
│   ├── payments.py
│   └── fallback.py
├── keyboards/
│   ├── webapp.py
│   └── inline.py
├── middlewares/
│   └── logging.py
└── services/
    └── api_client.py       # HTTP к DRF (опционально)
```

---

## 9. Frontend Mini App (React + TypeScript)

### 9.1. Дизайн-система

На основе макета из GDD:

| Токен | Значение |
|-------|----------|
| Фон | `#0d0618` |
| Surface | `#1a0b2e` |
| Card | `#241438` |
| Gold accent | `#f5c542` |
| Purple accent | `#7c3aed` |
| Шрифт заголовков | Georgia / serif |
| Шрифт UI | system-ui |

Эффекты: градиентный фон, `card-glow`, золотой текст, haptic на действиях.

### 9.2. Роутинг

| Путь | Экран |
|------|-------|
| `/` | Главная |
| `/create` | Мастер создания (step param) |
| `/create/:mode` | Мастер с предвыбранным режимом |
| `/result/:id` | Результат генерации |
| `/daily` | Предсказание дня |
| `/history` | История |
| `/favorites` | Избранное (Коллекция) |
| `/profile` | Профиль и лимиты |
| `/premium` | Тарифы |

### 9.3. Экраны — детализация

#### Главная (`/`)
- Hero: логотип + слоган.
- Блок «Предсказание дня» (1 тап).
- Сетка режимов 3×4 (иконка + название).
- Карусель «Популярные персонажи».
- Bottom navigation.

#### Мастер создания (`/create`)
**Шаг 1 — Данные:**
- Имя (текст; кнопка «Моё имя из Telegram»).
- Повод (chip-кнопки).
- Дата рождения (date picker, опционально).
- Партнёр (для love-режима).
- Доп. инфо (textarea, опционально).

**Шаг 2 — Режим** (если не выбран на главной):
- Список / сетка режимов.

**Шаг 3 — Персонаж:**
- Фильтры: Все | Мистика | Юмор | История | Мудрецы.
- Сетка карточек персонажей (emoji, имя, описание).
- Премиум-персонажи с замком.

**Шаг 4 — Подтверждение:**
- Сводка параметров.
- `Telegram.WebApp.MainButton` → «✨ Сгенерировать».

Навигация: `BackButton` Telegram + прогресс-бар (4 точки).

#### Результат (`/result/:id`)
- Заголовок + персонаж.
- Вкладки: Текст | Аудио | Картинка | Видео.
- Текст — сразу; медиа — skeleton + polling каждые 2 сек.
- Кнопки: Поделиться, Ещё раз, В избранное, Оценить.
- Share через `openTelegramLink`.

#### История / Избранное
- Список карточек: превью текста, режим, дата.
- Тап → `/result/:id`.

#### Профиль
- Аватар из Telegram.
- Лимит: «3 из 5 сегодня».
- Кнопка Premium.
- Язык, любимый персонаж.

### 9.4. Ключевые компоненты

```
components/
├── layout/
│   ├── AppShell.tsx
│   ├── BottomNav.tsx
│   └── PageHeader.tsx
├── home/
│   ├── ModeGrid.tsx
│   ├── DailyFortuneCard.tsx
│   └── PersonaCarousel.tsx
├── create/
│   ├── StepData.tsx
│   ├── StepMode.tsx
│   ├── StepPersona.tsx
│   ├── StepConfirm.tsx
│   └── ProgressDots.tsx
├── result/
│   ├── ResultTabs.tsx
│   ├── TextResult.tsx
│   ├── AudioPlayer.tsx
│   ├── ImageResult.tsx
│   ├── VideoPlayer.tsx
│   └── ActionBar.tsx
└── ui/
    ├── Button.tsx
    ├── Chip.tsx
    ├── Card.tsx
    └── Skeleton.tsx
```

### 9.5. State management

| Слой | Инструмент | Данные |
|------|------------|--------|
| Server state | TanStack Query | modes, personas, generations, history |
| Wizard draft | Zustand | текущий шаг, введённые данные |
| Telegram | custom hook | WebApp, user, haptic, share |

### 9.6. API-клиент

- Базовый URL из `VITE_API_URL`.
- Interceptor: добавляет `Authorization: tma ${WebApp.initData}`.
- Обработка 429 (лимит) → экран Premium.
- Polling helper для `status: processing`.

---

## 10. AI-пайплайн и генерация контента

### 10.1. Поток генерации текста

```
1. GenerationService.create()
2. Проверка квоты (billing)
3. Сборка промпта (Jinja2 + persona + input_data)
4. Попытка LLM (Groq) → timeout 15s
5. При ошибке → FallbackService (шаблоны)
6. Сохранение GenerationResult
7. Возврат клиенту
```

### 10.2. Поток генерации медиа

```
1. POST /generate/{id}/media/ { type: "image" }
2. Celery task: ai.tasks.generate_image
3. Status: processing
4. ImageService → SDXL/Pollinations
5. Pillow: рамка, текст, watermark (free)
6. Upload → S3/MinIO или local media
7. MediaAsset.status = completed
8. Push notification via bot
```

### 10.3. Приоритет AI-провайдеров

| Тип | Primary | Fallback |
|-----|---------|----------|
| Текст | Groq (Qwen/Llama) | Ollama → шаблоны |
| Картинка | HF Inference / Pollinations | Шаблонная открытка Pillow |
| Аудио | edge-tts | Piper (если настроен) |
| Видео | MoviePy (слайдшоу) | — |
| Музыка | MusicGen (фаза 3) | — |

### 10.4. Режимы контента — фазы подключения AI

| Режим | Фаза | AI | Медиа |
|-------|------|-----|-------|
| greeting | 1 | LLM | — |
| horoscope | 1 | LLM + zodiac calc | — |
| poem | 1 | LLM | — |
| song (текст) | 1 | LLM | — |
| roast | 1 | LLM | — |
| prediction | 1 | LLM | — |
| toast | 2 | LLM | — |
| tarot | 2 | LLM | — |
| meme | 2 | LLM | — |
| love | 2 | LLM | — |
| personality | 2 | LLM | — |
| song (музыка) | 3 | LLM + MusicGen | audio |
| greeting | 2 | LLM | image |
| * | 2 | — | tts (audio) |
| * | 3 | — | video (FFmpeg) |
| fable | 3 | LLM | — |

---

## 11. Персонажи и промпт-инженерия

### 11.1. Стартовый набор (12 персонажей)

| slug | Имя | Категория | Premium |
|------|-----|-----------|---------|
| tarot-critic | Таро-критик | mystic | нет |
| bench-granny | Бабка с лавочки | humor | нет |
| fortune-cookie | Печенье-мудрец | sages | нет |
| nostradamus | Нострадамус | history | нет |
| standup-comic | Стендап-комик | humor | нет |
| gypsy | Цыганка | mystic | нет |
| shaman | Шаман | mystic | да |
| odessa-humor | Одесский юмор | humor | нет |
| butler | Дворецкий | sages | нет |
| roast-master | Ростер-мастер | humor | нет |
| love-oracle | Оракул любви | mystic | да |
| ceo-motivator | CEO-мотиватор | sages | да |

### 11.2. Структура system_prompt (Jinja2)

```
Ты — {{ persona.name }}, {{ persona.title }}.
Говори в стиле: {{ persona.voice_tone }}.
Начни с фразы в духе: «{{ persona.signature }}».
Язык: {{ locale }}.
Длина: 80–150 слов.
Без markdown. Живо, вирально, для мессенджера.
```

### 11.3. User prompt (пример greeting)

```
Создай поздравление для {{ name }}.
Повод: {{ event_label }}.
{% if extra %}Особенность: {{ extra }}.{% endif %}
```

### 11.4. Модерация

- Запрет: политика, ненависть, NSFW, травля.
- Roast: «добрый roast», без оскорблений по защищённым признакам.
- Post-filter: список стоп-слов перед отдачей.

---

## 12. Очереди, кэш и долгие задачи

### 12.1. Celery tasks

| Task | Очередь | Timeout |
|------|---------|---------|
| `generate_image` | `media` | 120s |
| `generate_audio` | `media` | 60s |
| `generate_video` | `media` | 180s |
| `generate_music` | `gpu` | 300s |
| `send_telegram_notification` | `default` | 10s |
| `cleanup_old_media` | `low` | — |

### 12.2. Redis кэш

| Ключ | TTL | Данные |
|------|-----|--------|
| `modes:list` | 1h | Каталог режимов |
| `personas:list` | 1h | Персонажи |
| `daily:{user_id}:{date}` | 24h | Предсказание дня |
| `ratelimit:{user_id}` | 1d | Счётчик генераций |

### 12.3. Rate limiting (DRF throttling)

| Тариф | Лимит |
|-------|-------|
| Free | 5 генераций / день |
| Premium | 999 / день |
| Media (free) | 1 картинка / день |
| Media (premium) | безлимит |

---

## 13. Авторизация и безопасность

### 13.1. Telegram initData

1. Mini App → `window.Telegram.WebApp.initData`.
2. Backend: парсинг query string → сортировка → HMAC-SHA256(`WebAppData`, SHA256(bot_token)).
3. Проверка `auth_date` (не старше 24h).
4. Извлечение `user` JSON.

### 13.2. Безопасность API

- HTTPS only в production.
- CORS: только `WEBAPP_URL` и `https://web.telegram.org`.
- CSRF не нужен для token-based TMA auth.
- Валидация всех входных полей (max length, sanitize).
- File upload: whitelist MIME, max 10MB.
- Secrets только в env, не в репозитории.

### 13.3. Защита AI

- Timeout на LLM-запросы.
- Max tokens limit.
- Логирование промптов без PII в Sentry.

---

## 14. Монетизация и лимиты

### 14.1. Тарифы

| | Free | Premium |
|---|------|---------|
| Цена | 0 | Telegram Stars / месяц |
| Генерации | 5/день | безлимит |
| Текст | ✅ | ✅ |
| Картинки | 1/день, watermark | HD, без watermark |
| Аудио | ❌ | ✅ |
| Видео | ❌ | ✅ |
| Персонажи | базовые | все |
| Очередь | обычная | приоритет |

### 14.2. Telegram Stars flow

1. `/premium` в боте → invoice (Stars).
2. `successful_payment` handler → DRF webhook внутренний.
3. `Subscription` создаётся / продлевается.

### 14.3. Проверка лимитов

- Middleware / service перед каждой генерацией.
- `UsageQuota` инкремент атомарно (select_for_update).
- Ответ 429 + `quota_remaining: 0` + ссылка на Premium.

---

## 15. Социальные и вирусные механики

### 15.1. Механики из GDD

| Механика | Реализация |
|----------|------------|
| Публикация в ленту | Share URL + текст из `share_text` |
| Рейтинг гороскопа | POST `/rate/` |
| Случайное предсказание дня | GET `/daily-fortune/` |
| Совместная рулетка | Фаза 3: групповой режим |
| Шаблоны сообщений | `share_text` с UTM |
| Реферальная система | `?start=ref_{telegram_id}`, +3 генерации |
| Сезонные события | `EventType.season_*`, баннер на главной |
| Награды / ачивки | Фаза 4 |
| Шеринг в сторис | `shareToStory` TWA SDK (если доступно) |

### 15.2. Share text формат

```
✨ {title}

{body}

— {persona} | AI Fortune Studio
🔗 Создай своё: t.me/YourBot/app
```

---

## 16. Поэтапный Roadmap

### Фаза 0 — Подготовка (3–5 дней)

**Цель:** скелет проекта, CI, локальный запуск.

| # | Задача | Компонент |
|---|--------|-----------|
| 0.1 | Инициализация репозитория, .gitignore, README | all |
| 0.2 | Docker compose: db, redis, api | infra |
| 0.3 | Django project + DRF + apps scaffold | backend |
| 0.4 | aiogram bot: /start + WebApp кнопка (заглушка URL) | bot |
| 0.5 | Vite + React + Tailwind + TWA SDK scaffold | frontend |
| 0.6 | Nginx config (dev) | infra |
| 0.7 | GitHub Actions: lint + test | ci |

**Результат:** `docker compose up` поднимает все сервисы, бот отвечает /start, Mini App открывается (пустая).

---

### Фаза 1 — MVP: текстовая генерация (2–3 недели)

**Цель:** полный цикл «выбрал → ввёл → сгенерировал → поделился».

#### Backend
| # | Задача |
|---|--------|
| 1.1 | Модели: TelegramUser, ContentMode, Persona, Generation, GenerationResult |
| 1.2 | Seed data: 4 режима, 9 персонажей |
| 1.3 | TelegramInitDataAuthentication |
| 1.4 | Endpoints: modes, personas, generate, me, history |
| 1.5 | LLM service (Groq) + fallback templates |
| 1.6 | Jinja2 промпты: greeting, horoscope, poem, roast |
| 1.7 | UsageQuota: 5/день |
| 1.8 | daily-fortune endpoint |

#### Frontend
| # | Задача |
|---|--------|
| 1.9 | Дизайн-система (цвета, компоненты ui/) |
| 1.10 | Главная: ModeGrid + DailyFortuneCard |
| 1.11 | Мастер 4 шага (Zustand) |
| 1.12 | Экран результата (текст) |
| 1.13 | Share, History, BottomNav |
| 1.14 | Профиль с лимитами |
| 1.15 | Обработка ошибок и 429 |

#### Bot
| # | Задача |
|---|--------|
| 1.16 | WebApp кнопка с реальным URL |
| 1.17 | /daily deep link |

**Результат:** пользователь генерирует поздравление/гороскоп/стих/roast и шерит в Telegram.

---

### Фаза 2 — Расширение режимов + медиа (2–3 недели)

**Цель:** картинки, озвучка, больше режимов.

| # | Задача | Компонент |
|---|--------|-----------|
| 2.1 | Режимы: toast, tarot, meme, love, personality, prediction | backend |
| 2.2 | Celery + worker в docker-compose | infra |
| 2.3 | ImageService (Pollinations / HF) | backend |
| 2.4 | TTSService (edge-tts) | backend |
| 2.5 | MediaAsset model + POST /media/ | backend |
| 2.6 | Polling статуса на фронте | frontend |
| 2.7 | Вкладки Аудио / Картинка на результате | frontend |
| 2.8 | AudioPlayer, ImageResult компоненты | frontend |
| 2.9 | Избранное (favorites) | backend + frontend |
| 2.10 | Рейтинг (+1/-1) | backend + frontend |
| 2.11 | Bot: push «медиа готово» | bot |
| 2.12 | Watermark на free-картинках | backend |
| 2.13 | S3/MinIO для медиа | infra |

**Результат:** открытка + озвучка поздравления, 10+ режимов.

---

### Фаза 3 — Музыка, видео, социал (2–3 недели)

| # | Задача |
|---|--------|
| 3.1 | MusicGen integration (Celery gpu queue) |
| 3.2 | VideoService: FFmpeg + MoviePy (картинка + аудио + субтитры) |
| 3.3 | Вкладка Видео на результате |
| 3.4 | Реферальная система |
| 3.5 | Сезонные баннеры (НГ, 8 марта, 14 февраля) |
| 3.6 | Telegram Stars оплата Premium |
| 3.7 | Премиум-персонажи (lock на фронте) |
| 3.8 | Redis кэш каталогов |

**Результат:** полный мультимедийный цикл, монетизация.

---

### Фаза 4 — Полировка и масштаб (ongoing)

| # | Задача |
|---|--------|
| 4.1 | Корпоративные шаблоны (HR, юбилеи) |
| 4.2 | API для сторонних сервисов (DRF API keys) |
| 4.3 | Локализация EN |
| 4.4 | ComfyUI / FLUX для качественных картинок |
| 4.5 | AI-видео (Wan 2.1) — исследование |
| 4.6 | Аналитика (Metabase / Grafana) |
| 4.7 | A/B тесты промптов |
| 4.8 | PaddleOCR — загрузка фото |

---

## 17. Тестирование

### 17.1. Backend

| Тип | Инструмент | Покрытие |
|-----|------------|----------|
| Unit | pytest + pytest-django | services, prompts, auth |
| API | pytest + DRF APIClient | все endpoints |
| AI | mocked httpx | llm fallback paths |
| Celery | pytest-celery (eager mode) | tasks |

### 17.2. Frontend

| Тип | Инструмент |
|-----|------------|
| Unit | Vitest + Testing Library |
| E2E | Playwright (опционально, фаза 2) |

### 17.3. Bot

| Тип | Инструмент |
|-----|------------|
| Handlers | pytest + aiogram test utilities |

### 17.4. Чеклист ручного теста (перед релизом)

- [ ] Mini App открывается на iOS Telegram
- [ ] Mini App открывается на Android Telegram
- [ ] initData auth работает
- [ ] Генерация текста < 10 сек
- [ ] Share открывает диалог Telegram
- [ ] Лимит 5/день блокирует 6-ю генерацию
- [ ] BackButton Telegram работает в мастере
- [ ] Тёмная/светлая тема Telegram не ломает UI

---

## 18. Деплой и CI/CD

### 18.1. Production сервер (минимум)

| Параметр | Значение |
|----------|----------|
| VPS | 4 CPU, 8GB RAM (Hetzner / Timeweb) |
| OS | Ubuntu 24.04 |
| GPU | Не обязателен до фазы 3 (облачные API) |

### 18.2. CI pipeline

```
push → lint (ruff, eslint) → test (pytest, vitest) → build (docker images) → deploy (staging)
tag v* → deploy production
```

### 18.3. Production checklist

- [ ] HTTPS (Let's Encrypt)
- [ ] BotFather: Mini App URL, webhook
- [ ] PostgreSQL backups (daily)
- [ ] Sentry DSN
- [ ] GROQ_API_KEY в secrets
- [ ] DEBUG=False
- [ ] CORS настроен
- [ ] Static frontend через Nginx
- [ ] Celery worker running
- [ ] Health check monitoring

### 18.4. Домены

| Домен | Назначение |
|-------|------------|
| `app.example.com` | Mini App (React static) |
| `api.example.com` | DRF API |
| `api.example.com/bot/webhook/` | aiogram webhook |

---

## 19. Риски и митигация

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| Лимиты Groq free tier | Высокая | Среднее | Ollama fallback + шаблоны |
| Долгая генерация медиа | Средняя | Высокое | Celery + уведомления + polling |
| Блокировка контента (roast) | Средняя | Высокое | Модерация промптов + фильтры |
| Авторские права (Disney и т.д.) | Низкая | Высокое | Свои стили, не копировать бренды |
| Telegram Mini App ограничения | Средняя | Среднее | Бот как fallback |
| Высокая стоимость GPU | Средняя | Среднее | Облачные API на старте, GPU позже |
| Низкий retention | Высокая | Высокое | Daily fortune, push, сезоны |

---

## 20. Критерии готовности по фазам

### Фаза 0 — Done когда:
- `docker compose up` без ошибок
- Бот отвечает /start с кнопкой Web App
- Mini App загружается в Telegram
- CI зелёный

### Фаза 1 — Done когда:
- 4 режима генерируют уникальный текст через LLM
- 9+ персонажей меняют стиль
- Полный мастер 4 шага работает на мобилке
- Share отправляет текст в Telegram
- История сохраняется
- Лимит 5/день работает
- Daily fortune доступен

### Фаза 2 — Done когда:
- 10+ режимов
- Картинка-открытка генерируется < 2 мин
- Озвучка работает
- Избранное и рейтинг работают
- Push от бота при готовности медиа

### Фаза 3 — Done когда:
- Premium через Stars
- Рефералка даёт бонус
- Видео-поздравление собирается
- Сезонные баннеры на главной

---

## Приложение A — Оценка трудозатрат

| Фаза | Срок | FTE |
|------|------|-----|
| Фаза 0 | 3–5 дней | 1 dev |
| Фаза 1 | 2–3 недели | 1 dev |
| Фаза 2 | 2–3 недели | 1 dev |
| Фаза 3 | 2–3 недели | 1 dev |
| Фаза 4 | ongoing | 1 dev |

**Итого до полноценного продукта:** ~8–10 недель одним разработчиком.

---

## Приложение B — Порядок разработки (рекомендуемый)

Когда дадите команду «приступаем», рекомендую такой порядок:

1. **Фаза 0 целиком** — инфраструктура.
2. **Backend модели + seed** — personas, modes.
3. **Auth initData** — без этого фронт не подключить.
4. **LLM service + 1 режим** (greeting) — проверить AI.
5. **Frontend главная + мастер** — UI.
6. **Связка generate end-to-end** — первый рабочий flow.
7. **Остальные режимы фазы 1** — horoscope, poem, roast.
8. **Bot WebApp + share** — полный Telegram flow.
9. **History, daily, limits** — завершение фазы 1.
10. Далее по roadmap фаз 2–3.

---

*Документ подготовлен для согласования. Код не написан. Разработка начинается по команде после утверждения плана.*
