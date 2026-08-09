# AI Fortune Studio

Telegram Mini App для персонализированного развлекательного контента: поздравления, гороскопы, стихи, предсказания и др. — в уникальном стиле выбранного персонажа (Бабка с лавочки, Нострадамус, Таро-критик и др.).

**Стек:** Django REST Framework · aiogram 3 · React · TypeScript · Tailwind CSS

---

## Документация проекта

| Файл | Описание |
|------|----------|
| [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) | Архитектура, API, модели, roadmap |
| [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) | Пошаговая инструкция разработки |

Разработка ведётся **только на localhost** до завершения Фазы 4. Деплой — Фаза 5.

---

## Требования

- Python 3.12+
- Node.js 20+
- Docker Desktop (PostgreSQL и Redis)
- Git

Опционально (позже): токен Telegram-бота ([@BotFather](https://t.me/BotFather)), [ngrok](https://ngrok.com/) для проверки Mini App на телефоне.

---

## Быстрый старт (локально)

### Ежедневный запуск (шаг 0.10)

Один скрипт поднимает Docker (PostgreSQL + Redis) и печатает команды для остальных терминалов:

```powershell
# Windows (из корня проекта)
.\scripts\dev.ps1
```

```bash
# Linux / macOS
./scripts/dev.sh
```

Дальше в отдельных терминалах: backend (`runserver`), frontend (`npm run dev`), bot (`python main.py`).  
Туннель для телефона — по необходимости: `.\scripts\Start-Tunnel.ps1` (шаг 0.9).

---

### 1. Клонировать и настроить окружение

```powershell
cd "AI-Fortune-Studio"
copy .env.example .env
# Отредактируйте .env при необходимости (BOT_TOKEN — с шага 0.7)
```

### 2. Инфраструктура (после шага 0.2)

**Сначала запустите Docker Desktop**, затем:

```powershell
.\scripts\dev.ps1
# или только БД/Redis:  .\scripts\Start-Infra.ps1
# или: docker compose up -d db redis
```

PostgreSQL слушает порт **5433** (не 5432 — чтобы не конфликтовать с локальным PG Windows).

### 3. Backend (после шага 0.3)

```powershell
cd backend
python -m venv .venv
pip install -r requirements/dev.txt
python manage.py migrate
python manage.py runserver
```

**Автоактивация venv в PowerShell** (один раз):

```powershell
.\scripts\Install-BackendAutoActivate.ps1
# перезапустите терминал; затем cd backend — (.venv) появится сам
```

В терминале **Cursor** venv активируется через `.vscode/settings.json`.

API: [http://localhost:8000/api/v1/health/](http://localhost:8000/api/v1/health/)

### 4. Frontend (после шага 0.5)

```powershell
cd frontend
npm install
npm run dev
```

Mini App (браузер): [http://localhost:5173](http://localhost:5173)

### 5. Telegram-бот (после шага 0.7)

Можно использовать тот же `backend/.venv` или отдельный `bot/.venv`:

```powershell
cd bot
# если активен backend/.venv — достаточно:
pip install -r requirements.txt
python main.py

# либо отдельное окружение бота:
# .\.venv\Scripts\Activate.ps1
# pip install -r requirements.txt
# python main.py
```

### 6. HTTPS-туннель для Telegram (шаг 0.9)

На телефоне Mini App открывается только по **HTTPS**. Поднимите Vite (`npm run dev`), затем:

```powershell
# Один раз: клиент туннеля (без аккаунта)
winget install Cloudflare.cloudflared

# Из корня проекта (Vite уже должен слушать :5173)
.\scripts\Start-Tunnel.ps1
```

Скрипт выдаст URL вида `https://….trycloudflare.com`, пропишет его в `WEBAPP_URL` и попросит **перезапустить бота**.  
В Telegram: `/start` → «Открыть студию».  
Опционально: BotFather → Bot Settings → Menu Button = тот же HTTPS URL.

Альтернатива как в гайде: `ngrok http 5173` (нужен authtoken с ngrok.com).

---

## Локальные URL

| Сервис | URL |
|--------|-----|
| Frontend | http://localhost:5173 |
| Frontend (туннель, шаг 0.9) | HTTPS URL из `.\scripts\Start-Tunnel.ps1` → `WEBAPP_URL` |
| Backend API | http://localhost:8000 |
| Health check | http://localhost:8000/api/v1/health/ |
| Django Admin | http://localhost:8000/admin/ |
| PostgreSQL | localhost:5433 |
| Redis | localhost:6379 |

---

## Структура репозитория (целевая)

```
AI-Fortune-Studio/
├── backend/          # Django + DRF
├── bot/              # aiogram 3
├── frontend/         # React Mini App
├── scripts/          # Start-Infra, Start-Tunnel, dev.ps1 / dev.sh (шаг 0.10)
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Текущий статус разработки

- [x] Шаг 0.1 — корень репозитория
- [x] Шаг 0.2 — Docker Compose (db + redis)
- [x] Шаг 0.3 — Django + DRF
- [x] Шаг 0.4 — Health endpoint
- [x] Шаг 0.5 — Frontend (Vite + React + TS + Tailwind)
- [x] Шаг 0.6 — Telegram WebApp SDK + dev/mock
- [x] Шаг 0.7 — aiogram 3 (polling)
- [x] Шаг 0.8 — Django Admin (локальная панель)
- [x] Шаг 0.9 — Туннель для проверки в Telegram
- [x] Шаг 0.10 — Скрипт локального запуска (`scripts/dev.ps1`, `scripts/dev.sh`)
- [x] Шаг 1.1 — Модели пользователей (`TelegramUser`, `UserSettings`)
- [x] Шаг 1.2 — Модели контента (`ContentMode`, `Persona`, `EventType`, `Generation*`)
- [x] Шаг 1.3 — Seed-данные (`python manage.py seed_data`)
- [x] Шаг 1.4 — Auth Telegram initData + dev bypass (`GET /api/v1/me/`)
- [x] Шаг 1.5 — Catalog API (`modes`, `personas`, `events`, `seasonal`)
- [x] Шаг 1.6 — LLM + fallback (`apps.ai`, `pytest apps/ai/tests/test_fallback.py`)
- [x] Шаг 1.7 — GenerationService (запись Generation + Result в БД)
- [x] Шаг 1.8 — POST `/api/v1/generate/` (+ GET detail)
- [x] Шаг 1.9 — Квоты (`UsageQuota`, 6-й запрос → 429)
- [ ] Фаза 1 — см. [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)

---

## Лицензия

Проект в разработке. Лицензия будет указана позже.
