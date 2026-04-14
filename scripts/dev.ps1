param(
  [switch]$Restart
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$apiDir = Join-Path $root "apps/api"
$webDir = Join-Path $root "apps/web"
$outputDir = Join-Path $root "output"
$stateFile = Join-Path $root ".dev-stack.json"
$webCacheDir = Join-Path $webDir ".next-dev"
$apiReadyUrl = "http://localhost:8000/health/ready"
$webReadyUrl = "http://localhost:3000/matches"
$apiPort = 8000
$webPort = 3000

function Get-ApiPython {
  $candidates = @(
    (Join-Path $apiDir ".venv/Scripts/python.exe"),
    (Join-Path $apiDir ".venv/bin/python")
  )

  foreach ($candidate in $candidates) {
    if (Test-Path -LiteralPath $candidate) {
      return (Resolve-Path -LiteralPath $candidate).Path
    }
  }

  $python = Get-Command python -ErrorAction SilentlyContinue
  if ($null -ne $python) {
    return $python.Source
  }

  throw "Python executable not found for API startup."
}

function Get-NodeExecutable {
  $node = Get-Command node -ErrorAction SilentlyContinue
  if ($null -eq $node) {
    throw "Node.js executable not found for web startup."
  }

  return $node.Source
}

function Test-ProcessRunning {
  param([int]$ProcessId)

  if ($ProcessId -le 0) {
    return $false
  }

  return $null -ne (Get-Process -Id $ProcessId -ErrorAction SilentlyContinue)
}

function Stop-ProcessTree {
  param([int]$ProcessId)

  if ($ProcessId -le 0) {
    return
  }

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

function Stop-DevProcesses {
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

  foreach ($targetProcessId in Get-ListeningPids -Ports @($apiPort, $webPort)) {
    if ($targetProcessId -and $targetProcessId -ne $PID) {
      [void]$pidsToStop.Add([int]$targetProcessId)
    }
  }

  foreach ($targetProcessId in $pidsToStop) {
    if (Test-ProcessRunning -ProcessId $targetProcessId) {
      Stop-ProcessTree -ProcessId $targetProcessId
    }
  }

  Remove-Item -LiteralPath $stateFile -Force -ErrorAction SilentlyContinue
}

function Test-HttpOk {
  param([string]$Url)

  try {
    $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
    return ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300)
  } catch {
    return $false
  }
}

function Wait-HttpReady {
  param(
    [string]$Url,
    [string]$Name,
    [int]$TimeoutSeconds = 90
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)

  while ((Get-Date) -lt $deadline) {
    if (Test-HttpOk -Url $Url) {
      Write-Output "$Name is ready at $Url"
      return
    }

    Start-Sleep -Seconds 1
  }

  throw "$Name did not become ready at $Url within ${TimeoutSeconds}s."
}

if ($Restart) {
  Write-Output "Restart requested. Stopping any existing dev stack first."
  Stop-DevProcesses
} elseif ((Test-HttpOk -Url $apiReadyUrl) -and (Test-HttpOk -Url $webReadyUrl)) {
  Write-Output "Dev stack is already healthy."
  exit 0
} else {
  Stop-DevProcesses
}

New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$apiStdOut = Join-Path $outputDir "api-dev.out.log"
$apiStdErr = Join-Path $outputDir "api-dev.err.log"
$webStdOut = Join-Path $outputDir "web-dev.out.log"
$webStdErr = Join-Path $outputDir "web-dev.err.log"

foreach ($logPath in @($apiStdOut, $apiStdErr, $webStdOut, $webStdErr)) {
  if (Test-Path -LiteralPath $logPath) {
    Remove-Item -LiteralPath $logPath -Force
  }
}

if (Test-Path -LiteralPath $webCacheDir) {
  Write-Output "Removing stale Next.js cache at $webCacheDir"
  Remove-Item -LiteralPath $webCacheDir -Recurse -Force
}

$apiPython = Get-ApiPython
$nodeExe = Get-NodeExecutable

$apiProcess = Start-Process `
  -FilePath $apiPython `
  -ArgumentList @("-m", "uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "$apiPort") `
  -WorkingDirectory $apiDir `
  -RedirectStandardOutput $apiStdOut `
  -RedirectStandardError $apiStdErr `
  -PassThru

$webProcess = Start-Process `
  -FilePath $nodeExe `
  -ArgumentList @(".\\scripts\\dev.mjs", "--hostname", "0.0.0.0", "--port", "$webPort") `
  -WorkingDirectory $webDir `
  -RedirectStandardOutput $webStdOut `
  -RedirectStandardError $webStdErr `
  -PassThru

$state = [ordered]@{
  api_pid = $apiProcess.Id
  web_pid = $webProcess.Id
  api_url = "http://localhost:$apiPort"
  web_url = "http://localhost:$webPort"
  api_ready_url = $apiReadyUrl
  web_ready_url = $webReadyUrl
  api_logs = @{
    stdout = $apiStdOut
    stderr = $apiStdErr
  }
  web_logs = @{
    stdout = $webStdOut
    stderr = $webStdErr
  }
  started_at = (Get-Date).ToString("o")
}

$state | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $stateFile -Encoding UTF8

try {
  Wait-HttpReady -Url $apiReadyUrl -Name "API readiness"
  Wait-HttpReady -Url $webReadyUrl -Name "Web matches page"
} catch {
  Write-Output $_.Exception.Message
  Write-Output "API logs: $apiStdOut | $apiStdErr"
  Write-Output "Web logs: $webStdOut | $webStdErr"
  Stop-DevProcesses
  exit 1
}

Write-Output "Dev stack started successfully."
Write-Output "Web: http://localhost:$webPort"
Write-Output "API: http://localhost:$apiPort"
Write-Output "Logs:"
Write-Output "  $apiStdOut"
Write-Output "  $apiStdErr"
Write-Output "  $webStdOut"
Write-Output "  $webStdErr"
