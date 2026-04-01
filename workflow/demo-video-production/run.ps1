param(
  [string]$BaseUrl = "http://127.0.0.1:3100",
  [switch]$SkipRecord
)

$ErrorActionPreference = "Stop"

$WorkflowRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent (Split-Path -Parent $WorkflowRoot)
$RecordScript = Join-Path $RepoRoot "apps/web/scripts/record-demo-video.mjs"
$RenderScript = Join-Path $RepoRoot "apps/web/scripts/render-demo-video.ps1"
$OutputRoot = Join-Path $RepoRoot "output/demo"

if (-not (Test-Path -LiteralPath $RecordScript)) {
  throw "Missing record script: $RecordScript"
}

if (-not (Test-Path -LiteralPath $RenderScript)) {
  throw "Missing render script: $RenderScript"
}

function Assert-LastExitCode {
  param([string]$Step)
  if ($LASTEXITCODE -ne 0) {
    throw "$Step failed with exit code $LASTEXITCODE"
  }
}

New-Item -ItemType Directory -Force -Path $OutputRoot | Out-Null

Write-Output "Demo workflow started"
Write-Output "Base URL: $BaseUrl"
Write-Output "Output: $OutputRoot"

if (-not $SkipRecord) {
  $env:DEMO_BASE_URL = $BaseUrl
  Push-Location (Join-Path $RepoRoot "apps/web")
  node ".\scripts\record-demo-video.mjs"
  Assert-LastExitCode "Record demo video"
  Pop-Location
} else {
  Write-Output "SkipRecord enabled, reusing existing raw assets"
}

powershell -ExecutionPolicy Bypass -File $RenderScript
Assert-LastExitCode "Render demo video"

Write-Output ""
Write-Output "Artifacts:"
Write-Output (Join-Path $OutputRoot "system-demo-raw.webm")
Write-Output (Join-Path $OutputRoot "system-demo-final.mp4")
Write-Output (Join-Path $OutputRoot "demo-script.md")
Write-Output (Join-Path $OutputRoot "system-demo.srt")
Write-Output (Join-Path $OutputRoot "system-demo-shifted.srt")
Write-Output (Join-Path $OutputRoot "system-demo-manifest.json")
