# Поднимает PostgreSQL и Redis для локальной разработки (шаг 0.2).
# Запуск из корня проекта:  .\scripts\Start-Infra.ps1

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path $PSScriptRoot -Parent

Write-Host "AI Fortune Studio — инфраструктура (db + redis)" -ForegroundColor Cyan
Write-Host ""

# Проверка, что Docker Desktop запущен
docker info 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ОШИБКА: Docker не запущен." -ForegroundColor Red
    Write-Host ""
    Write-Host "1. Запустите Docker Desktop и дождитесь статуса Running"
    Write-Host "2. Повторите:  .\scripts\Start-Infra.ps1"
    Write-Host ""
    Write-Host "Без Docker Django не подключится к PostgreSQL (порт 5433)."
    exit 1
}

Push-Location $projectRoot
try {
    docker compose up -d db redis
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    Write-Host ""
    docker compose ps
    Write-Host ""
    Write-Host "Готово. Теперь в другом терминале:" -ForegroundColor Green
    Write-Host "  cd backend"
    Write-Host "  python manage.py runserver"
}
finally {
    Pop-Location
}
