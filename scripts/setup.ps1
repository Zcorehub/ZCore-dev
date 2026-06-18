$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

Write-Host ""
Write-Host "=== ZCore setup ===" -ForegroundColor Cyan

Write-Host ""
Write-Host "[1/5] Creating .env files from examples..." -ForegroundColor Yellow

$ServerEnv = Join-Path $Root "Server\.env"
$ServerExample = Join-Path $Root "Server\.env.example"
if (-not (Test-Path $ServerEnv)) {
  Copy-Item $ServerExample $ServerEnv
  Write-Host "  Created Server/.env"
} else {
  Write-Host "  Server/.env already exists - skipped"
}

$FrontEnv = Join-Path $Root "Front\.env.local"
$FrontExample = Join-Path $Root "Front\.env.example"
if (-not (Test-Path $FrontEnv)) {
  Copy-Item $FrontExample $FrontEnv
  Write-Host "  Created Front/.env.local"
} else {
  Write-Host "  Front/.env.local already exists - skipped"
}

Write-Host ""
Write-Host "[2/5] Starting MySQL (Docker)..." -ForegroundColor Yellow
Set-Location $Root

$mysqlReady = $false
try {
  docker info 2>&1 | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "Docker not running" }
  docker compose up -d
  Write-Host "  Waiting for MySQL to be ready..."
  for ($i = 0; $i -lt 30; $i++) {
    $health = docker inspect --format="{{.State.Health.Status}}" zcore-mysql 2>$null
    if ($health -eq "healthy") {
      $mysqlReady = $true
      break
    }
    Start-Sleep -Seconds 2
  }
  if ($mysqlReady) {
    Write-Host "  MySQL is ready." -ForegroundColor Green
  } else {
    Write-Host "  MySQL started but healthcheck timed out." -ForegroundColor DarkYellow
    $mysqlReady = $true
  }
} catch {
  Write-Host "  Docker is not running. Start Docker Desktop, then: npm run db:up" -ForegroundColor Red
}

Write-Host ""
Write-Host "[3/5] Installing dependencies..." -ForegroundColor Yellow
Set-Location (Join-Path $Root "Server")
npm install
Set-Location (Join-Path $Root "Front")
npm install --legacy-peer-deps

Write-Host ""
Write-Host "[4/5] Running database migrations and seed..." -ForegroundColor Yellow
Set-Location (Join-Path $Root "Server")
npx prisma generate

if ($mysqlReady) {
  npx prisma migrate deploy
  npm run prisma:seed
  Write-Host "  Database migrated and seeded." -ForegroundColor Green
} else {
  Write-Host "  Skipped migrations - MySQL not available." -ForegroundColor DarkYellow
  Write-Host "  After starting Docker: npm run db:up && npm run prisma:migrate && npm run prisma:seed"
}

Write-Host ""
Write-Host "[5/5] Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "  Terminal 1: npm run dev:server   (API  -> http://localhost:3000)"
Write-Host "  Terminal 2: npm run dev:front    (DApp -> http://localhost:3001)"
Write-Host ""
Write-Host "  Dev API keys: dev_tw_key_local | dev_blend_key_local | dev_vaquita_key_local"
Write-Host ""

Set-Location $Root
