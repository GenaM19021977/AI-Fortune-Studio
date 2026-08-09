# =============================================================================
# AI Fortune Studio — единая точка входа в локальную разработку (шаг 0.10)
#
# Что делает этот скрипт:
#   1) проверяет .env и Docker Desktop;
#   2) поднимает PostgreSQL + Redis (docker compose);
#   3) печатает готовые команды для остальных терминалов
#      (backend / frontend / bot / туннель / celery позже).
#
# Почему не стартует всё в одном окне:
#   runserver, Vite и бот — долгоживущие процессы с логами.
#   Их удобнее держать в отдельных терминалах Cursor/Windows Terminal,
#   чтобы видеть ошибки каждого сервиса.
#
# Запуск из корня репозитория:
#   .\scripts\dev.ps1
# =============================================================================

$ErrorActionPreference = "Stop"

# Кириллица в Windows Terminal / старых консолях без UTF-8 выглядит как «кракозябры»
try {
    $utf8 = [System.Text.UTF8Encoding]::new()
    [Console]::OutputEncoding = $utf8
    $OutputEncoding = $utf8
    chcp 65001 | Out-Null
}
catch {
    # Не блокируем запуск, если chcp недоступен
}

# Корень репозитория: родитель каталога scripts/
$projectRoot = Split-Path $PSScriptRoot -Parent
$envFile = Join-Path $projectRoot ".env"
$backendDir = Join-Path $projectRoot "backend"
$frontendDir = Join-Path $projectRoot "frontend"
$botDir = Join-Path $projectRoot "bot"

function Write-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host ("=" * 64) -ForegroundColor DarkCyan
    Write-Host " $Title" -ForegroundColor Cyan
    Write-Host ("=" * 64) -ForegroundColor DarkCyan
}

function Test-HttpOk {
    # Быстрая проверка, что сервис уже отвечает (не падаем, только статус)
    param([string]$Url)
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
        return $response.StatusCode -ge 200 -and $response.StatusCode -lt 400
    }
    catch {
        return $false
    }
}

Write-Section "AI Fortune Studio — локальный запуск (шаг 0.10)"
Write-Host "Корень проекта: $projectRoot"

# --- 1. .env должен существовать (секреты и URL не коммитим) ---
if (-not (Test-Path $envFile)) {
    Write-Host ""
    Write-Host "ОШИБКА: нет файла .env" -ForegroundColor Red
    Write-Host "Скопируйте шаблон и заполните BOT_TOKEN:"
    Write-Host "  copy .env.example .env"
    exit 1
}
Write-Host "OK: .env найден" -ForegroundColor Green

# --- 2. Инфраструктура: PostgreSQL :5433 + Redis :6379 ---
# Переиспользуем Start-Infra.ps1, чтобы не дублировать проверку Docker
Write-Section "Терминал 1 — Docker (db + redis)"
$infraScript = Join-Path $PSScriptRoot "Start-Infra.ps1"
& $infraScript
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

# --- 3. Подсказка: какие процессы уже живы (чтобы не плодить дубликаты) ---
Write-Section "Текущий статус портов"
$backendUp = Test-HttpOk "http://127.0.0.1:8000/api/v1/health/"
$frontendUp = Test-HttpOk "http://127.0.0.1:5173/"
Write-Host ("  Backend  :8000  → {0}" -f $(if ($backendUp) { "уже работает" } else { "не запущен" }))
Write-Host ("  Frontend :5173  → {0}" -f $(if ($frontendUp) { "уже работает" } else { "не запущен" }))

# Путь к python из backend/.venv, если venv уже создан
$backendPython = Join-Path $backendDir ".venv\Scripts\python.exe"
$botPython = Join-Path $botDir ".venv\Scripts\python.exe"
if (Test-Path $backendPython) {
    $runBackendPython = ".\.venv\Scripts\python.exe"
}
else {
    $runBackendPython = "python"
}
if (Test-Path $botPython) {
    $runBotPython = ".\.venv\Scripts\python.exe"
}
elseif (Test-Path $backendPython) {
    # Бот может жить на backend venv, если зависимости aiogram стоят там
    $runBotPython = "..\backend\.venv\Scripts\python.exe"
}
else {
    $runBotPython = "python"
}

# --- 4. Команды для отдельных терминалов (копипаст) ---
Write-Section "Терминал 2 — Backend (Django)"
Write-Host "  cd `"$backendDir`""
if (-not (Test-Path (Join-Path $backendDir ".venv"))) {
    Write-Host "  python -m venv .venv"
    Write-Host "  .\.venv\Scripts\Activate.ps1"
    Write-Host "  pip install -r requirements\dev.txt"
    Write-Host "  python manage.py migrate"
}
Write-Host "  $runBackendPython manage.py runserver"
Write-Host "  → http://localhost:8000/api/v1/health/" -ForegroundColor DarkGray
Write-Host "  → http://localhost:8000/admin/" -ForegroundColor DarkGray

Write-Section "Терминал 3 — Frontend (Vite Mini App)"
Write-Host "  cd `"$frontendDir`""
if (-not (Test-Path (Join-Path $frontendDir "node_modules"))) {
    Write-Host "  npm install"
}
Write-Host "  npm run dev"
Write-Host "  → http://localhost:5173" -ForegroundColor DarkGray

Write-Section "Терминал 4 — Telegram-бот (polling)"
Write-Host "  cd `"$botDir`""
Write-Host "  $runBotPython main.py"
Write-Host "  В Telegram: /start у вашего бота (не у @BotFather)" -ForegroundColor DarkGray

Write-Section "Опционально — HTTPS-туннель (шаг 0.9, для телефона)"
Write-Host "  Сначала должен работать Vite на :5173, затем:"
Write-Host "  .\scripts\Start-Tunnel.ps1"
Write-Host "  После смены WEBAPP_URL — перезапустите бота." -ForegroundColor DarkGray

Write-Section "Позже (фаза 2+) — Celery worker"
Write-Host "  cd `"$backendDir`""
Write-Host "  $runBackendPython -m celery -A config worker -l info"
Write-Host "  (пока не нужен — медиа-задачи появятся в фазе 2)" -ForegroundColor DarkGray

Write-Section "Готово"
Write-Host "Инфраструктура поднята. Откройте терминалы 2–4 и выполните команды выше." -ForegroundColor Green
Write-Host "Документация: DEVELOPMENT_GUIDE.md, README.md"
Write-Host ""
