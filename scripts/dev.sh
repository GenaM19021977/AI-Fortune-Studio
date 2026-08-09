#!/usr/bin/env bash
# =============================================================================
# AI Fortune Studio — локальный запуск (шаг 0.10), Linux / macOS
#
# Аналог scripts/dev.ps1 для Windows:
#   1) проверяет .env и Docker;
#   2) поднимает PostgreSQL + Redis;
#   3) печатает команды для отдельных терминалов.
#
# Запуск из корня репозитория:
#   chmod +x scripts/dev.sh   # один раз
#   ./scripts/dev.sh
# =============================================================================

set -euo pipefail

# Каталог скрипта → корень репозитория
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$PROJECT_ROOT/.env"

section() {
  # Визуальный разделитель блоков в терминале
  echo ""
  echo "================================================================"
  echo " $1"
  echo "================================================================"
}

http_ok() {
  # true, если URL отвечает 2xx/3xx (сервис уже запущен)
  local url="$1"
  if command -v curl >/dev/null 2>&1; then
    curl -fsS --max-time 2 "$url" >/dev/null 2>&1
  else
    return 1
  fi
}

section "AI Fortune Studio — локальный запуск (шаг 0.10)"
echo "Корень проекта: $PROJECT_ROOT"

# --- 1. .env ---
if [[ ! -f "$ENV_FILE" ]]; then
  echo ""
  echo "ОШИБКА: нет файла .env"
  echo "Скопируйте шаблон:  cp .env.example .env"
  exit 1
fi
echo "OK: .env найден"

# --- 2. Docker: db + redis ---
section "Терминал 1 — Docker (db + redis)"
if ! docker info >/dev/null 2>&1; then
  echo "ОШИБКА: Docker не запущен. Запустите Docker Desktop / daemon и повторите."
  exit 1
fi

cd "$PROJECT_ROOT"
docker compose up -d db redis
docker compose ps

# --- 3. Статус портов ---
section "Текущий статус портов"
if http_ok "http://127.0.0.1:8000/api/v1/health/"; then
  echo "  Backend  :8000  → уже работает"
else
  echo "  Backend  :8000  → не запущен"
fi
if http_ok "http://127.0.0.1:5173/"; then
  echo "  Frontend :5173  → уже работает"
else
  echo "  Frontend :5173  → не запущен"
fi

# Предпочитаем venv, если уже создан
BACKEND_PY="python"
BOT_PY="python"
if [[ -x "$PROJECT_ROOT/backend/.venv/bin/python" ]]; then
  BACKEND_PY="./.venv/bin/python"
fi
if [[ -x "$PROJECT_ROOT/bot/.venv/bin/python" ]]; then
  BOT_PY="./.venv/bin/python"
elif [[ -x "$PROJECT_ROOT/backend/.venv/bin/python" ]]; then
  BOT_PY="../backend/.venv/bin/python"
fi

section "Терминал 2 — Backend (Django)"
echo "  cd \"$PROJECT_ROOT/backend\""
if [[ ! -d "$PROJECT_ROOT/backend/.venv" ]]; then
  echo "  python -m venv .venv"
  echo "  source .venv/bin/activate"
  echo "  pip install -r requirements/dev.txt"
  echo "  python manage.py migrate"
fi
echo "  $BACKEND_PY manage.py runserver"
echo "  → http://localhost:8000/api/v1/health/"
echo "  → http://localhost:8000/admin/"

section "Терминал 3 — Frontend (Vite Mini App)"
echo "  cd \"$PROJECT_ROOT/frontend\""
if [[ ! -d "$PROJECT_ROOT/frontend/node_modules" ]]; then
  echo "  npm install"
fi
echo "  npm run dev"
echo "  → http://localhost:5173"

section "Терминал 4 — Telegram-бот (polling)"
echo "  cd \"$PROJECT_ROOT/bot\""
echo "  $BOT_PY main.py"
echo "  В Telegram: /start у вашего бота (не у @BotFather)"

section "Опционально — HTTPS-туннель (шаг 0.9)"
echo "  # Vite должен слушать :5173"
echo "  cloudflared tunnel --url http://127.0.0.1:5173"
echo "  # или: ngrok http 5173"
echo "  # Затем WEBAPP_URL=https://… в .env и перезапуск бота"

section "Позже (фаза 2+) — Celery worker"
echo "  cd \"$PROJECT_ROOT/backend\""
echo "  $BACKEND_PY -m celery -A config worker -l info"

section "Готово"
echo "Инфраструктура поднята. Откройте терминалы 2–4 и выполните команды выше."
echo ""
