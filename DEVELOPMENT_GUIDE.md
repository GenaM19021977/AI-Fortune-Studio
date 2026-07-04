# AI Fortune Studio — Пошаговая инструкция разработки

**Версия:** 1.1  
**Дата:** 3 июля 2026  
**Связанные документы:** `IMPLEMENTATION_PLAN.md`, `.cursor/rules/`

> Этот документ — **порядок написания кода**: что создаём, в какой последовательности, что проверяем после каждого шага.  
> Не начинайте шаг N+1, пока шаг N не пройден по чеклисту «Готово когда».

---

## Стратегия: только локальная разработка

**До полного завершения проекта вся разработка ведётся на локальной машине.**  
Деплой на сервер, Nginx, SSL, webhook и production-конфигурация — **только после** успешного прохождения всех фаз на localhost (см. [Фаза 5 — Деплой](#фаза-5--деплой-после-успешной-локальной-разработки)).

### Локальная схема

```
┌─────────────────────────────────────────────────────────────┐
│                    Ваш компьютер (localhost)                 │
│                                                              │
│  Frontend (Vite)     http://localhost:5173                  │
│       │ proxy /api                                           │
│       ▼                                                      │
│  Backend (Django)    http://localhost:8000                  │
│       │                                                      │
│       ├── PostgreSQL   localhost:5432  (Docker)             │
│       └── Redis        localhost:6379  (Docker)             │
│                                                              │
│  Bot (aiogram)       polling, без webhook                   │
│  Celery worker       локальный процесс (фаза 2+)            │
│  Медиафайлы          backend/media/  (локальная папка)    │
└─────────────────────────────────────────────────────────────┘

Проверка в Telegram (по необходимости):
  ngrok / localtunnel → HTTPS URL → WEBAPP_URL в .env
```

### Локальные URL (зафиксировать в `.env`)

| Сервис | URL | Как запускать |
|--------|-----|---------------|
| Frontend | `http://localhost:5173` | `cd frontend && npm run dev` |
| Backend API | `http://localhost:8000` | `cd backend && python manage.py runserver` |
| API health | `http://localhost:8000/api/v1/health/` | — |
| PostgreSQL | `localhost:5433` | `docker compose up -d db` |
| Redis | `localhost:6379` | `docker compose up -d redis` |
| Django Admin | `http://localhost:8000/admin/` | после createsuperuser |

### Что НЕ делаем до Фазы 5 (деплой)

- Nginx, SSL, домены
- Webhook бота (только **polling**)
- `docker-compose.prod.yml`
- S3 / MinIO в облаке (файлы в `backend/media/`)
- GitHub Actions CI (опционально, можно подключить позже)
- Gunicorn (только `runserver`)
- Sentry в production

### Три уровня проверки UI

| Уровень | Где | Когда использовать |
|---------|-----|-------------------|
| **1. Браузер** | `http://localhost:5173` | Каждый день, 90% разработки UI |
| **2. Telegram + туннель** | ngrok HTTPS → Vite | Auth initData, WebApp SDK, share |
| **3. Телефон** | То же через туннель | Финальная проверка фазы |

💬 **Комментарий:**  
В обычном браузере `initData` нет — фронт работает в **dev/mock режиме** (см. шаг 0.6).  
Для проверки авторизации и кнопки бота один раз настраиваете туннель — инструкция в шаге 0.9.

---

## Как пользоваться инструкцией

| Обозначение | Значение |
|-------------|----------|
| **Шаг X.Y** | Конкретная задача (X — фаза, Y — номер) |
| 💬 **Комментарий** | Зачем этот шаг нужен, на что обратить внимание |
| 📁 **Файлы** | Что создать или изменить |
| ✅ **Готово когда** | Критерий перехода к следующему шагу |
| 🔗 **Зависит от** | Предыдущие шаги, без которых не начинать |
| 🖥️ **Локально** | Команда или URL для проверки на вашей машине |

**Порядок разработки:** инфраструктура localhost → backend → frontend в браузере → связка с Telegram через туннель → медиа → монетизация → **в конце** деплой.

---

## Фаза 0 — Скелет проекта на localhost (3–5 дней)

### Шаг 0.1 — Корень репозитория

📁 **Файлы:**
- `.gitignore` — обязательно: `.env`, `node_modules/`, `__pycache__/`, `backend/media/`, `.venv/`
- `.env.example` — шаблон **локальных** переменных (см. ниже)
- `README.md` — как запустить всё на localhost
- `scripts/dev.ps1` или `scripts/dev.sh` — скрипт запуска всех сервисов (создать в шаге 0.10)

💬 **Комментарий:**  
README с первого дня описывает **локальный** запуск, не production.  
Секреты только в `.env` на вашей машине, не в git.

**`.env.example` (локальная разработка):**
```env
# Django
DJANGO_SETTINGS_MODULE=config.settings.dev
SECRET_KEY=dev-secret-change-me
DEBUG=True
DATABASE_URL=postgres://fortune:fortune@localhost:5432/fortune
REDIS_URL=redis://localhost:6379/0

# URLs (localhost)
API_URL=http://localhost:8000
WEBAPP_URL=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://web.telegram.org

# Telegram
BOT_TOKEN=your_bot_token_from_botfather

# AI (опционально на старте — есть fallback)
GROQ_API_KEY=

# Локальные медиа
MEDIA_ROOT=backend/media
```

✅ **Готово когда:** репозиторий чистый, `.env` в `.gitignore`, `.env.example` заполнен.

---

### Шаг 0.2 — Docker Compose (только БД и Redis)

📁 **Файлы:**
- `docker-compose.yml` — **только** `db` и `redis`

💬 **Комментарий:**  
На локальной разработке в Docker держим **минимум**: PostgreSQL и Redis.  
Django, бот, frontend, Celery — **обычные процессы** в терминале: проще дебаг и hot reload.  
Не добавляйте в compose сервисы `api`, `nginx`, `frontend` — это для Фазы 5.

```yaml
# docker-compose.yml — только инфраструктура данных
# db: postgres:16, ports 5433:5432 (хост 5433 — не конфликтует с локальным PG Windows)
# redis: redis:7-alpine, ports 6379:6379
```

🖥️ **Локально:**
```bash
docker compose up -d db redis
docker compose ps   # оба healthy
```

✅ **Готово когда:** PostgreSQL принимает подключение на `localhost:5433`, Redis на `6379`.

---

### Шаг 0.3 — Django + DRF: инициализация (dev settings)

📁 **Файлы:**
```
backend/
├── manage.py
├── requirements/
│   ├── base.txt
│   └── dev.txt          # prod.txt создадим в Фазе 5, сейчас не нужен
└── config/
    ├── settings/
    │   ├── base.py
    │   └── dev.py       # единственный активный settings на время разработки
    ├── urls.py
    └── wsgi.py
```

💬 **Комментарий:**  
**Всю разработку** ведите с `DJANGO_SETTINGS_MODULE=config.settings.dev`.  
`dev.py`: `DEBUG=True`, `ALLOWED_HOSTS=["localhost","127.0.0.1"]`, CORS на `http://localhost:5173`.  
`MEDIA_URL=/media/`, `MEDIA_ROOT` — локальная папка `backend/media/`.  
Файл `prod.py` не создаём до Фазы 5 — не отвлекает.

🖥️ **Локально:**
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements/dev.txt
python manage.py migrate
python manage.py runserver
# → http://localhost:8000
```

✅ **Готово когда:** migrate ok, runserver на порту 8000.

🔗 **Зависит от:** 0.1, 0.2

---

### Шаг 0.4 — Health endpoint

📁 **Файлы:**
- `config/urls.py` — префикс `/api/v1/`
- health view

🖥️ **Локально:** `curl http://localhost:8000/api/v1/health/` → `{"status":"ok"}`

✅ **Готово когда:** 200 JSON на localhost.

---

### Шаг 0.5 — Frontend: Vite + React + TypeScript + Tailwind

📁 **Файлы:** стандартная структура `frontend/`

💬 **Комментарий:**  
**vite.config.ts** — proxy на локальный Django (без CORS-проблем):
```ts
server: {
  port: 5173,
  proxy: {
    '/api': 'http://localhost:8000',
  },
},
```

🖥️ **Локально:**
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

✅ **Готово когда:** страница открывается в Chrome на localhost.

---

### Шаг 0.6 — Telegram WebApp SDK + dev/mock режим

📁 **Файлы:**
- `frontend/src/hooks/useTelegram.ts`
- `frontend/src/config/dev.ts` — флаг `VITE_DEV_MOCK_TELEGRAM=true`

💬 **Комментарий:**  
**90% времени** вы работаете в браузере на `localhost:5173` без Telegram.  
Хук `useTelegram` при `!window.Telegram` возвращает mock:
```ts
// mock для локальной разработки без Telegram
{ userName: 'Тест', isTelegram: false, initData: '' }
```
Backend в dev может принимать заголовок `Authorization: tma-dev` с фиксированным тестовым user (добавим в шаге 1.4) — **только при DEBUG=True**.

✅ **Готово когда:** UI работает в браузере без ошибок Telegram SDK.

---

### Шаг 0.7 — aiogram 3: бот в режиме polling

📁 **Файлы:**
```
bot/
├── requirements.txt
├── main.py
├── config.py
└── handlers/start.py
```

💬 **Комментарий:**  
**Только polling** — `dp.start_polling()`. Webhook не настраиваем до деплоя.  
`WEBAPP_URL` в `.env` на старте: `http://localhost:5173` (для кнопки в браузере не сработает — это нормально).  
После шага 0.9 замените на HTTPS URL туннеля.

🖥️ **Локально:**
```bash
cd bot
pip install -r requirements.txt
python main.py
# В Telegram: /start → бот отвечает
```

✅ **Готово когда:** бот отвечает на `/start` при запущенном `python main.py`.

---

### Шаг 0.8 — Django Admin (локальная панель)

🖥️ **Локально:**
```bash
python manage.py createsuperuser
# → http://localhost:8000/admin/
```

💬 **Комментарий:**  
Админка на localhost — основной инструмент управления каталогом персонажей и режимов без отдельного UI.

✅ **Готово когда:** вход в админку на localhost.

---

### Шаг 0.9 — Туннель для проверки в Telegram (по необходимости)

💬 **Комментарий:**  
Telegram Mini App **требует HTTPS**, кроме `localhost` в некоторых desktop-клиентах.  
Для **телефона** нужен туннель:

```bash
# Вариант 1: ngrok
ngrok http 5173
# → https://abc123.ngrok-free.app

# Обновить .env:
WEBAPP_URL=https://abc123.ngrok-free.app
# Перезапустить бота
```

В BotFather → Bot Settings → Menu Button / Web App — URL туннеля (временно).

**Когда поднимать туннель:**
- шаг 1.4 (проверка initData)
- шаг 1.19 (полный flow в Telegram)
- финальный чеклист фазы

**Когда НЕ нужен:** вёрстка, API в Postman, pytest, браузер.

✅ **Готово когда:** один раз открыли Mini App с телефона через туннель.

---

### Шаг 0.10 — Скрипт локального запуска

📁 **Файлы:**
- `scripts/dev.ps1` (Windows) или `scripts/dev.sh` (Linux/macOS)

💬 **Комментарий:**  
Один скрипт поднимает инфраструктуру и напоминает команды для 3 терминалов:

```
Терминал 1: docker compose up -d db redis
Терминал 2: backend — runserver
Терминал 3: frontend — npm run dev
Терминал 4: bot — python main.py
(Терминал 5, фаза 2+: celery worker)
```

✅ **Готово когда:** README описывает запуск, скрипт есть.

---

### ✅ Чеклист конца Фазы 0 (всё на localhost)

- [ ] `docker compose up -d db redis`
- [ ] Django: `http://localhost:8000/api/v1/health/` → 200
- [ ] Frontend: `http://localhost:5173` открывается
- [ ] Admin: `http://localhost:8000/admin/`
- [ ] Бот отвечает на `/start` (polling)
- [ ] `.env` настроен, не в git
- [ ] (Опционально) туннель проверен с телефона

---

## Фаза 1 — MVP на localhost (2–3 недели)

> Цель: полный цикл в браузере на localhost, затем проверка в Telegram через туннель.

### Шаг 1.1 — Модели пользователей (`apps/users`)

📁 **Файлы:** `TelegramUser`, `UserSettings`, admin, миграции

💬 **Комментарий:** без изменений по сути — всё в локальной PostgreSQL.

🖥️ **Локально:** `python manage.py migrate` → таблицы в Docker Postgres.

✅ **Готово когда:** модели видны в admin на localhost.

---

### Шаг 1.2 — Модели контента (`apps/content`)

📁 **Файлы:** `ContentMode`, `Persona`, `EventType`, `Generation`, `GenerationResult`

✅ **Готово когда:** админка позволяет добавить режим и персонажа.

---

### Шаг 1.3 — Seed-данные

🖥️ **Локально:** `python manage.py seed_data`

4 режима: `greeting`, `horoscope`, `poem`, `roast`.  
9 персонажей из плана.

✅ **Готово когда:** `GET http://localhost:8000/api/v1/personas/` возвращает список (после шага 1.5).

---

### Шаг 1.4 — Авторизация Telegram initData + dev bypass

📁 **Файлы:**
- `telegram_auth.py` — HMAC-проверка
- `authentication.py` — DRF auth class
- **dev only:** `DevBypassAuthentication` при `DEBUG=True` + заголовок `X-Dev-User-Id: 1`

💬 **Комментарий:**  
**Локально в браузере** нет initData → dev bypass создаёт тестового `TelegramUser`.  
**В Telegram** через туннель — настоящий `Authorization: tma <initData>`.  
Dev bypass **никогда** не включать в production (Фаза 5).

🖥️ **Локально:**
```bash
# Браузер / Postman (dev)
curl -H "X-Dev-User-Id: 1" http://localhost:8000/api/v1/me/

# Telegram (туннель + реальный initData)
# проверка с телефона
```

✅ **Готово когда:** API работает в браузере (dev) и в Telegram (initData).

---

### Шаг 1.5 — Catalog API (read-only)

🖥️ **Локально:**
```
GET http://localhost:8000/api/v1/modes/
GET http://localhost:8000/api/v1/personas/
GET http://localhost:8000/api/v1/events/
GET http://localhost:8000/api/v1/schema/swagger-ui/   # drf-spectacular
```

✅ **Готово когда:** Swagger на localhost, JSON в Postman.

---

### Шаг 1.6 — LLM + fallback

💬 **Комментарий:**  
**Сначала fallback** — можно разрабатывать без `GROQ_API_KEY` полностью на localhost.  
Groq подключается когда захотите проверить качество текста.

🖥️ **Локально:** `pytest apps/ai/tests/test_fallback.py -v`

✅ **Готово когда:** тесты проходят без интернета (fallback).

---

### Шаг 1.7 — GenerationService

🖥️ **Локально:**
```bash
python manage.py shell
>>> from apps.content.services.generation_service import GenerationService
>>> # создать тестовую генерацию
```

✅ **Готово когда:** запись в локальной БД.

---

### Шаг 1.8 — POST `/api/v1/generate/`

🖥️ **Локально:**
```bash
curl -X POST http://localhost:8000/api/v1/generate/ \
  -H "Content-Type: application/json" \
  -H "X-Dev-User-Id: 1" \
  -d '{"content_mode":"greeting","persona_id":"bench-granny","name":"Александр","event":"birthday"}'
```

✅ **Готово когда:** JSON с текстом поздравления на localhost.

---

### Шаг 1.9 — Квоты (`apps/billing`)

🖥️ **Локально:** 6-й запрос за день → 429.

---

### Шаг 1.10 — me, history, daily-fortune

🖥️ **Локально:** все endpoints через localhost + dev auth.

---

### Шаг 1.11 — Frontend: дизайн-система

🖥️ **Локально:** `http://localhost:5173/dev/ui` — компоненты.

---

### Шаг 1.12 — API-клиент

💬 **Комментарий:**  
`VITE_API_URL` пустой — запросы через Vite proxy на `localhost:8000`.  
В dev режиме клиент шлёт `X-Dev-User-Id` если нет initData.

🖥️ **Локально:** Network tab → запросы на `/api/v1/modes` → 200.

---

### Шаг 1.13 — Layout + роутинг

🖥️ **Локально:** навигация в браузере на `localhost:5173`.

---

### Шаг 1.14 — Главная страница

🖥️ **Локально:** режимы грузятся с `localhost:8000` через proxy.

---

### Шаг 1.15 — Zustand store мастера

---

### Шаг 1.16 — Мастер (4 шага)

🖥️ **Локально:** полный мастер в браузере, MainButton — эмуляция кнопкой на странице (в браузере нет Telegram MainButton).

💬 **Комментарий:**  
Добавьте компонент `DevMainButton` — виден только при `!isTelegram`, дублирует MainButton.

---

### Шаг 1.17 — Экран результата

🖥️ **Локально:** generate → результат в браузере.

---

### Шаг 1.18 — История + Профиль

---

### Шаг 1.19 — Связка с Telegram (туннель)

📁 **Файлы:** обновить `WEBAPP_URL` в `.env` на HTTPS туннель

🖥️ **Локально:**
1. `ngrok http 5173`
2. `.env`: `WEBAPP_URL=https://....ngrok-free.app`
3. Перезапуск бота
4. Телефон: /start → «Открыть студию» → Mini App

✅ **Готово когда:** полный flow на **реальном телефоне** через туннель к вашему localhost.

💬 **Комментарий:**  
Бэкенд всё ещё на `localhost:8000` — Vite proxy прокидывает API.  
Ngrok туннелирует только frontend (5173). Это нормальная локальная схема.

---

### Шаг 1.20 — Тесты (локально)

🖥️ **Локально:**
```bash
cd backend && pytest
cd frontend && npm run build && npx tsc --noEmit
```

💬 **Комментарий:**  
CI (GitHub Actions) — **опционально**, подключите перед Фазой 5 или когда появится remote.

✅ **Готово когда:** pytest зелёный, `npm run build` без ошибок.

---

### ✅ Чеклист конца Фазы 1

**Localhost (браузер):**
- [ ] Мастер → генерация → результат → история
- [ ] 4 режима, 9 персонажей
- [ ] Квота 5/день
- [ ] Fallback без Groq ключа

**Telegram (туннель, один прогон):**
- [ ] initData auth
- [ ] Share в чат
- [ ] iOS или Android

---

## Фаза 2 — Медиа на localhost (2–3 недели)

### Шаг 2.1 — Celery worker (локальный процесс)

📁 **Файлы:** `config/celery.py`, `apps/ai/tasks.py`

💬 **Комментарий:**  
Worker запускается **в терминале**, не в Docker:
```bash
# Терминал: Redis уже в Docker
celery -A config worker -l info -Q media,default
```
В `dev.py`: `CELERY_TASK_ALWAYS_EAGER=False` для реальной проверки очереди.  
Для быстрых тестов: `CELERY_TASK_ALWAYS_EAGER=True` — задачи синхронно.

🖥️ **Локально:** task `delay()` → лог в терминале worker.

---

### Шаг 2.2 — MediaAsset + async API

💬 **Комментарий:**  
Файлы сохраняются в `backend/media/generations/` — локальная папка.  
Django раздаёт медиа в dev: `urlpatterns + static(MEDIA_URL, document_root=MEDIA_ROOT)`.

🖥️ **Локально:** `http://localhost:8000/media/generations/xxx.jpg`

---

### Шаг 2.3 — ImageService

Free: Pollinations / HF. Результат — файл в `MEDIA_ROOT`.

---

### Шаг 2.4 — TTSService (edge-tts)

Локально, без GPU. mp3 в `backend/media/audio/`.

---

### Шаг 2.5 — Новые режимы + промпты

---

### Шаг 2.6 — Frontend: вкладки Аудио / Картинка + polling

---

### Шаг 2.7 — Избранное и рейтинг

---

### Шаг 2.8 — Bot: уведомление «медиа готово»

🖥️ **Локально:** бот в polling должен быть запущен; после Celery task — сообщение в Telegram.

---

### ✅ Чеклист конца Фазы 2 (localhost)

- [ ] 10+ режимов
- [ ] Картинка сохраняется в `backend/media/`
- [ ] Озвучка проигрывается в Mini App
- [ ] Celery worker локально
- [ ] Push от бота при готовности медиа

---

## Фаза 3 — Монетизация и социал (на localhost, 2–3 недели)

| Шаг | Задача | Локальная проверка |
|-----|--------|-------------------|
| 3.1 | Subscription + Stars | Stars **тестируются** в Telegram test mode; на localhost логика premium через флаг в admin |
| 3.2 | Premium guard | Заблокировать режим → 403 в Postman |
| 3.3 | Реферал `?start=ref_` | Два тестовых аккаунта Telegram |
| 3.4 | VideoService (FFmpeg) | Установить FFmpeg локально; mp4 в `media/` |
| 3.5 | MusicGen | Опционально; если нет GPU — отложить до деплоя на GPU-сервер |
| 3.6 | Сезонные баннеры | Видно на `localhost:5173` |
| 3.7 | Redis кэш | Redis в Docker, как с фазы 0 |

💬 **Комментарий:**  
Telegram Stars в dev-окружении ограничены — для localhost достаточно ручного `is_premium=True` в admin для проверки UI.

---

### ✅ Чеклист конца Фазы 3

- [ ] Premium UI и лимиты работают
- [ ] Реферал начисляет бонус (проверка в Telegram)
- [ ] Видео собирается локально (FFmpeg установлен)
- [ ] Все фичи из GDD фазы 1–3 проверены на localhost + один прогон через туннель

---

## Фаза 4 — Финальная полировка на localhost (1–2 недели)

> Последняя фаза **локальной** разработки перед деплоем.

| Шаг | Задача |
|-----|--------|
| 4.1 | Полный ручной чеклист (iOS + Android через туннель) |
| 4.2 | Покрытие тестами критичных paths (auth, generate, quota) |
| 4.3 | Оптимизация промптов по рейтингам |
| 4.4 | Удалить `/dev/ui`, dev bypass за флагом `ENABLE_DEV_AUTH=True` |
| 4.5 | Подготовить `requirements/prod.txt`, `config/settings/prod.py` (ещё не использовать) |
| 4.6 | Написать `DEPLOY.md` — черновик инструкции деплоя |
| 4.7 | README: финальная документация локального запуска |

### ✅ Критерий «локальная разработка завершена»

- [ ] Все фазы 0–4 пройдены
- [ ] pytest зелёный, build фронта без ошибок
- [ ] Полный user flow на телефоне через туннель
- [ ] Нет критических багов
- [ ] `DEPLOY.md` готов

**Только после этого** → Фаза 5.

---

## Фаза 5 — Деплой (после успешной локальной разработки)

> **Не начинать**, пока не выполнен чеклист Фазы 4.

### Шаг 5.1 — VPS и домен

- VPS (4 CPU, 8GB RAM)
- Домены: `app.example.com`, `api.example.com`
- DNS A-записи

### Шаг 5.2 — Production settings

- `config/settings/prod.py` — DEBUG=False, security headers
- `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS` — production URLs
- `ENABLE_DEV_AUTH=False` — обязательно

### Шаг 5.3 — Docker production

- `docker-compose.prod.yml` — api, celery, nginx, db, redis
- Gunicorn вместо runserver
- Nginx: SSL (Certbot), static frontend, proxy `/api`

### Шаг 5.4 — Бот: webhook

- `WEBAPP_URL=https://app.example.com`
- Webhook вместо polling
- BotFather: обновить Menu Button URL

### Шаг 5.5 — Медиа в production

- S3 / MinIO вместо локальной папки
- CDN для картинок и аудио

### Шаг 5.6 — CI/CD

- GitHub Actions: test → build → deploy
- Sentry DSN

### Шаг 5.7 — Мониторинг и бэкапы

- PostgreSQL daily backup
- Health check uptime

### Шаг 5.8 — Финальный smoke test на production

- [ ] Mini App с production URL
- [ ] Без туннеля, без dev bypass
- [ ] Stars оплата (если включена)

---

## Сводная таблица: порядок «что за чем»

```
── ЛОКАЛЬНАЯ РАЗРАБОТКА (Фазы 0–4) ──
0.1  gitignore, .env.example, README (localhost)
0.2  Docker: только db + redis
0.3  Django dev settings + runserver :8000
0.4  health API
0.5  Vite frontend :5173 + proxy /api
0.6  useTelegram + dev/mock режим
0.7  bot polling
0.8  Django admin
0.9  ngrok (когда нужен Telegram)
0.10 dev.ps1 / dev.sh
─────────────────────
1.1–1.3  models + seed
1.4  auth (initData + dev bypass)
1.5–1.10  API
1.11–1.18  frontend (браузер localhost)
1.19  Telegram через туннель
1.20  pytest локально
─────────────────────
2.x  Celery локально, media в backend/media/
3.x  premium, referral, video (FFmpeg local)
4.x  полировка, DEPLOY.md, prod configs (не активны)
─────────────────────
── ДЕПЛОЙ (только после Фазы 4) ──
5.1–5.8  VPS, nginx, SSL, webhook, S3, CI/CD
```

---

## Ежедневный workflow разработчика

```bash
# 1. Инфраструктура (один раз в день)
docker compose up -d db redis

# 2. Backend
cd backend && .venv\Scripts\activate && python manage.py runserver

# 3. Frontend
cd frontend && npm run dev

# 4. Bot (когда тестируете Telegram)
cd bot && python main.py

# 5. Celery (фаза 2+, отдельный терминал)
celery -A config worker -l info

# 6. Туннель (только для теста на телефоне)
ngrok http 5173
```

**Основная работа:** браузер `http://localhost:5173` + Postman/curl на `localhost:8000`.  
**Туннель:** 1–2 раза в неделю или перед завершением фазы.

---

## Правило для каждого коммита

1. Один шаг — один логический коммит.
2. В конце шага — ✅ «Готово когда» на localhost.
3. Не коммитить `.env`, `backend/media/`, `node_modules/`.
4. Комментарии в коде — по `.cursor/rules/00-core-standards.mdc`.
5. **Не смешивать** локальные dev-хаки с production-кодом без `# DEV ONLY` и проверки `DEBUG`.

---

## Команда старта

Когда будете готовы писать код:

> **«Приступаем к шагу 0.1»**

Разработка пойдёт на **localhost** по этой инструкции. Деплой — после Фазы 4.
