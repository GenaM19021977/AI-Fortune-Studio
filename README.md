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

### 1. Клонировать и настроить окружение

```powershell
cd "AI-Fortune-Studio"
copy .env.example .env
# Отредактируйте .env при необходимости (BOT_TOKEN — с шага 0.7)
```

### 2. Инфраструктура (после шага 0.2)

**Сначала запустите Docker Desktop**, затем:

```powershell
.\scripts\Start-Infra.ps1
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

```powershell
cd bot
pip install -r requirements.txt
python main.py
```

---

## Локальные URL

| Сервис | URL |
|--------|-----|
| Frontend | http://localhost:5173 |
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
├── scripts/          # скрипты запуска (шаг 0.10)
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
- [ ] Шаг 0.5 — Frontend
- [ ] …см. [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)

---

## Лицензия

Проект в разработке. Лицензия будет указана позже.
