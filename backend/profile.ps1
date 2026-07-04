# Автоматическая активация .venv при входе в папку backend (PowerShell).
#
# Установка (один раз):
#   .\scripts\Install-BackendAutoActivate.ps1
#
# Или вручную добавьте в $PROFILE строку:
#   . "D:\Developer\My project\AI-Fortune-Studio\backend\profile.ps1"

$script:AFSBackendRoot = $PSScriptRoot
$script:AFSVenvPath = Join-Path $AFSBackendRoot ".venv"
$script:AFSActivateScript = Join-Path $AFSVenvPath "Scripts\Activate.ps1"

function script:Invoke-AFSVenvSync {
    $inBackend = ($PWD.Path -eq $script:AFSBackendRoot) -or
        $PWD.Path.StartsWith($script:AFSBackendRoot + [System.IO.Path]::DirectorySeparatorChar)

    if ($inBackend -and (Test-Path $script:AFSActivateScript)) {
        if (-not $env:VIRTUAL_ENV -or ($env:VIRTUAL_ENV -ne $script:AFSVenvPath)) {
            . $script:AFSActivateScript
        }
        return
    }

    if ($env:VIRTUAL_ENV -eq $script:AFSVenvPath) {
        if (Get-Command deactivate -ErrorAction SilentlyContinue) {
            deactivate
        }
    }
}

# Перехват cd / Set-Location — активация сразу при смене каталога
if (-not (Get-Variable -Name AFS_OriginalSetLocation -Scope Global -ErrorAction SilentlyContinue)) {
    $global:AFS_OriginalSetLocation = Get-Command Set-Location
}

function global:Set-Location {
    [CmdletBinding(DefaultParameterSetName = "Path")]
    param(
        [Parameter(ParameterSetName = "Path", Position = 0, ValueFromPipeline = $true, ValueFromPipelineByPropertyName = $true)]
        [string]$Path,
        [Parameter(ParameterSetName = "LiteralPath", Position = 0, ValueFromPipelineByPropertyName = $true)]
        [string]$LiteralPath,
        [switch]$PassThru,
        [Parameter(ParameterSetName = "Stack")]
        [switch]$StackName
    )

    if ($PSCmdlet.ParameterSetName -eq "Stack") {
        Microsoft.PowerShell.Management\Set-Location -StackName:$StackName
    }
    elseif ($PSCmdlet.ParameterSetName -eq "LiteralPath") {
        Microsoft.PowerShell.Management\Set-Location -LiteralPath $LiteralPath -PassThru:$PassThru
    }
    else {
        Microsoft.PowerShell.Management\Set-Location -Path $Path -PassThru:$PassThru
    }

    Invoke-AFSVenvSync
}

Set-Alias -Name cd -Value Set-Location -Scope Global -Force -ErrorAction SilentlyContinue

# Если profile.ps1 подключили, уже находясь в backend
Invoke-AFSVenvSync
