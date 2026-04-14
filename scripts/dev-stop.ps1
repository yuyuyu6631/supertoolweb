$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$stateFile = Join-Path $root ".dev-stack.json"

function Test-ProcessRunning {
  param([int]$ProcessId)

  if ($ProcessId -le 0) { return $false }
  return $null -ne (Get-Process -Id $ProcessId -ErrorAction SilentlyContinue)
}

function Stop-ProcessTree {
  param([int]$ProcessId)

  if ($ProcessId -le 0) { return }
  & taskkill.exe /PID $ProcessId /T /F | Out-Null
}

function Get-ListeningPids {
  param([int[]]$Ports)

  $connections = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue
  if ($null -eq $connections) {
    return @()
  }

  return @(
    $connections |
      Where-Object { $_.LocalPort -in $Ports } |
      Select-Object -ExpandProperty OwningProcess -Unique
  )
}

$stoppedAny = $false
$pidsToStop = [System.Collections.Generic.HashSet[int]]::new()

if (Test-Path -LiteralPath $stateFile) {
  try {
    $state = Get-Content -LiteralPath $stateFile -Raw | ConvertFrom-Json
    foreach ($targetProcessId in @($state.api_pid, $state.web_pid)) {
      if ($targetProcessId) {
        [void]$pidsToStop.Add([int]$targetProcessId)
      }
    }
  } catch {
  }
}

foreach ($targetProcessId in Get-ListeningPids -Ports @(3000, 8000)) {
  if ($targetProcessId -and $targetProcessId -ne $PID) {
    [void]$pidsToStop.Add([int]$targetProcessId)
  }
}

foreach ($targetProcessId in $pidsToStop) {
  if (Test-ProcessRunning -ProcessId $targetProcessId) {
    Stop-ProcessTree -ProcessId $targetProcessId
    $stoppedAny = $true
  }
}

Remove-Item -LiteralPath $stateFile -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

if ($stoppedAny) {
  Write-Output "Dev stack stopped."
} else {
  Write-Output "No running dev stack found."
}
