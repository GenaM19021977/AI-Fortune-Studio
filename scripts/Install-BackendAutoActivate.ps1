# Устанавливает автоматическую активацию .venv при cd в backend/
# Запуск:  .\scripts\Install-BackendAutoActivate.ps1

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path $PSScriptRoot -Parent
$profileHook = Join-Path $projectRoot "backend\profile.ps1"
$marker = "# AI-Fortune-Studio: auto venv backend"

if (-not (Test-Path $profileHook)) {
    Write-Error "Не найден файл: $profileHook"
}

if (-not (Test-Path $PROFILE)) {
    $profileDir = Split-Path $PROFILE -Parent
    if (-not (Test-Path $profileDir)) {
        New-Item -ItemType Directory -Path $profileDir -Force | Out-Null
    }
    New-Item -ItemType File -Path $PROFILE -Force | Out-Null
    Write-Host "Создан профиль PowerShell: $PROFILE"
}

$profileContent = Get-Content -Path $PROFILE -Raw -ErrorAction SilentlyContinue
if ($profileContent -and $profileContent.Contains($marker)) {
    Write-Host "Автоактивация уже установлена в $PROFILE"
    exit 0
}

$hookLine = ". '$profileHook'  $marker"
Add-Content -Path $PROFILE -Value "`n$hookLine"

Write-Host ""
Write-Host "Готово. В профиль добавлено:" -ForegroundColor Green
Write-Host "  $hookLine"
Write-Host ""
Write-Host "Перезапустите PowerShell или выполните:" -ForegroundColor Yellow
Write-Host "  . `$PROFILE"
Write-Host ""
Write-Host "После этого при cd в backend venv активируется сам:"
Write-Host "  cd `"$($projectRoot)\backend`""
