# =============================================================================
# AI Fortune Studio — HTTPS-туннель к Vite (шаг 0.9 DEVELOPMENT_GUIDE.md)
#
# Зачем: Telegram Mini App на телефоне требует HTTPS. Локальный
# http://localhost:5173 с телефона не откроется. Туннель даёт временный
# публичный https://… URL, который проксирует на ваш Vite.
#
# Когда нужен туннель:
#   - проверка кнопки Web App с телефона;
#   - шаги 1.4 / 1.19 (реальный initData);
#   - финальный чеклист фазы.
# Когда НЕ нужен: вёрстка в Chrome, Postman, pytest.
#
# Запуск из корня проекта:
#   .\scripts\Start-Tunnel.ps1
#
# После старта скрипт:
#   1) печатает HTTPS URL;
#   2) обновляет WEBAPP_URL (+ CORS) в корневом .env;
#   3) напоминает перезапустить бота и проверить /start.
# =============================================================================

$ErrorActionPreference = "Stop"

# Корень репозитория (скрипт лежит в scripts/)
$projectRoot = Split-Path $PSScriptRoot -Parent
$envFile = Join-Path $projectRoot ".env"
$frontendPort = 5173
$localTarget = "http://127.0.0.1:$frontendPort"
# Лог туннеля: cloudflared/ngrok пишут URL в stderr — сохраняем в файл и парсим
$logFile = Join-Path $env:TEMP "ai-fortune-tunnel.log"

Write-Host "AI Fortune Studio — туннель для Telegram (шаг 0.9)" -ForegroundColor Cyan
Write-Host ""

# --- 1. Vite должен уже слушать :5173 (иначе туннель упрётся в пустоту) ---
try {
    $null = Invoke-WebRequest -Uri $localTarget -UseBasicParsing -TimeoutSec 3
    Write-Host "OK: Vite отвечает на $localTarget" -ForegroundColor Green
}
catch {
    Write-Host "ОШИБКА: frontend не запущен на порту $frontendPort." -ForegroundColor Red
    Write-Host "В другом терминале:"
    Write-Host "  cd frontend"
    Write-Host "  npm run dev"
    exit 1
}

# --- 2. Выбор инструмента: cloudflared (без аккаунта) или ngrok ---
function Find-TunnelTool {
    # cloudflared: быстрый trycloudflare.com URL без регистрации
    $cloudflared = Get-Command cloudflared -ErrorAction SilentlyContinue
    if ($cloudflared) {
        return @{ Name = "cloudflared"; Path = $cloudflared.Source }
    }

    # ngrok: как в DEVELOPMENT_GUIDE; нужен authtoken (ngrok config add-authtoken …)
    $ngrok = Get-Command ngrok -ErrorAction SilentlyContinue
    if ($ngrok) {
        return @{ Name = "ngrok"; Path = $ngrok.Source }
    }

    return $null
}

$tool = Find-TunnelTool
if (-not $tool) {
    Write-Host "Туннель-клиент не найден." -ForegroundColor Red
    Write-Host ""
    Write-Host "Установите один из вариантов:"
    Write-Host "  winget install Cloudflare.cloudflared   # проще, без токена"
    Write-Host "  winget install Ngrok.Ngrok              # как в гайде; нужен токен с ngrok.com"
    exit 1
}

Write-Host "Инструмент: $($tool.Name)" -ForegroundColor Yellow
Write-Host "Цель:       $localTarget"
Write-Host ""

# --- 3. Прописать HTTPS URL в .env (бот читает WEBAPP_URL при старте) ---
function Update-EnvWebappUrl {
    param(
        [Parameter(Mandatory = $true)][string]$HttpsUrl
    )

    if (-not (Test-Path $envFile)) {
        Write-Host "Файл .env не найден: $envFile" -ForegroundColor Red
        Write-Host "Скопируйте .env.example → .env и повторите."
        return
    }

    # Без завершающего слэша — Telegram WebApp URL так стабильнее
    $HttpsUrl = $HttpsUrl.TrimEnd("/")

    # Построчно: надёжнее, чем regex по всему файлу (CRLF / кодировки Windows)
    $lines = Get-Content -Path $envFile -Encoding UTF8
    $hasWebapp = $false
    $hasCors = $false
    $updated = foreach ($line in $lines) {
        if ($line -match '^WEBAPP_URL=') {
            $hasWebapp = $true
            "WEBAPP_URL=$HttpsUrl"
        }
        elseif ($line -match '^CORS_ALLOWED_ORIGINS=') {
            $hasCors = $true
            if ($line -like "*$HttpsUrl*") {
                $line
            }
            else {
                # Дописываем origin туннеля (нужен при прямых запросах к API)
                "$line,$HttpsUrl"
            }
        }
        else {
            $line
        }
    }

    if (-not $hasWebapp) {
        $updated += "WEBAPP_URL=$HttpsUrl"
    }
    if (-not $hasCors) {
        $updated += "CORS_ALLOWED_ORIGINS=http://localhost:5173,https://web.telegram.org,$HttpsUrl"
    }

    Set-Content -Path $envFile -Value $updated -Encoding UTF8
    Write-Host ""
    Write-Host "Обновлён .env:" -ForegroundColor Green
    Write-Host "  WEBAPP_URL=$HttpsUrl"
    Write-Host ""
    Write-Host "Дальше обязательно:" -ForegroundColor Yellow
    Write-Host "  1) Перезапустите бота (Ctrl+C → python main.py) — он читает .env при старте"
    Write-Host "  2) В Telegram: /start → «Открыть студию»"
    Write-Host "  3) (Опционально) BotFather → Bot Settings → Menu Button = этот же HTTPS URL"
    Write-Host ""
    Write-Host "Остановка туннеля: Ctrl+C в этом окне (URL тогда станет недействителен)."
}

# --- 4. Старт туннеля: stderr → лог-файл, из него вытаскиваем https://… ---
if (Test-Path $logFile) {
    Remove-Item $logFile -Force
}

# Пустой stdout-файл нужен Start-Process (оба потока нельзя в один файл)
$outFile = Join-Path $env:TEMP "ai-fortune-tunnel-out.log"
if (Test-Path $outFile) {
    Remove-Item $outFile -Force
}

if ($tool.Name -eq "cloudflared") {
    # Quick Tunnel: временный *.trycloudflare.com → localhost:5173
    $argumentList = @("tunnel", "--url", $localTarget)
    # Пример строки в логе: https://random-words.trycloudflare.com
    $urlRegex = 'https://[a-zA-Z0-9.-]+\.trycloudflare\.com'
}
else {
    # ngrok как в гайде. Заранее: ngrok config add-authtoken <token>
    $argumentList = @("http", "$frontendPort", "--log=stdout")
    $urlRegex = 'https://[a-zA-Z0-9.-]+\.ngrok(?:-free)?\.(?:app|dev|io)'
}

# -FilePath (не -FileName): в PowerShell 7 параметр называется именно так
$proc = Start-Process `
    -FilePath $tool.Path `
    -ArgumentList $argumentList `
    -RedirectStandardError $logFile `
    -RedirectStandardOutput $outFile `
    -PassThru `
    -NoNewWindow

Write-Host "Туннель запускается (PID $($proc.Id))…" -ForegroundColor Cyan

# Ждём появления публичного URL в логах (обычно 2–10 сек)
$publicUrl = $null
$deadline = (Get-Date).AddSeconds(60)
while ((Get-Date) -lt $deadline -and -not $proc.HasExited) {
    Start-Sleep -Seconds 1
    $combined = ""
    if (Test-Path $logFile) {
        $combined += Get-Content -Path $logFile -Raw -ErrorAction SilentlyContinue
    }
    if (Test-Path $outFile) {
        $combined += Get-Content -Path $outFile -Raw -ErrorAction SilentlyContinue
    }
    if ($combined -match $urlRegex) {
        $publicUrl = $Matches[0].TrimEnd("/")
        break
    }
}

if (-not $publicUrl) {
    Write-Host "Не удалось получить HTTPS URL за отведённое время." -ForegroundColor Red
    Write-Host "Лог: $logFile"
    if (Test-Path $logFile) {
        Get-Content $logFile -ErrorAction SilentlyContinue | Select-Object -Last 30
    }
    if (-not $proc.HasExited) {
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "Для ngrok убедитесь, что задан authtoken: ngrok config add-authtoken <token>"
    exit 1
}

Write-Host ""
Write-Host "Публичный URL Mini App:" -ForegroundColor Green
Write-Host "  $publicUrl" -ForegroundColor Green

Update-EnvWebappUrl -HttpsUrl $publicUrl

# Держим процесс: пока крутится туннель, URL валиден
Write-Host "Туннель работает. Не закрывайте это окно, пока тестируете в Telegram." -ForegroundColor Cyan
try {
    Wait-Process -Id $proc.Id
}
finally {
    if (-not $proc.HasExited) {
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    }
}
