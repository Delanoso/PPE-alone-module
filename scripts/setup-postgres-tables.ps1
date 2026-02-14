# Run once after you have a Postgres DATABASE_URL.
# Usage: .\scripts\setup-postgres-tables.ps1
#    or: $env:DATABASE_URL = "postgresql://..."; .\scripts\setup-postgres-tables.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

if (-not $env:DATABASE_URL) {
  Write-Host "DATABASE_URL is not set. Set it first, e.g.:" -ForegroundColor Yellow
  Write-Host '  $env:DATABASE_URL = "postgresql://user:pass@host:5432/dbname?sslmode=require"' -ForegroundColor Cyan
  Write-Host ""
  $url = Read-Host "Paste your Postgres connection string (or press Enter to exit)"
  if ($url) { $env:DATABASE_URL = $url } else { exit 1 }
}

Set-Location $root
Write-Host "Running prisma db push (schema: Postgres)..." -ForegroundColor Cyan
npx prisma db push --schema=apps/api/prisma/schema.postgresql.prisma
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "Done. Tables are ready." -ForegroundColor Green
