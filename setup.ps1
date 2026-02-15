cd "C:\Users\Erich van den Heuvel\Desktop\ppe-stand-alone\PPE-alone-module"

# Optional: checkout feature branch (skip if it doesn't exist)
git fetch origin cursor/ppe-management-system-61b3 2>$null
if ($LASTEXITCODE -eq 0) {
    git checkout -B cursor/ppe-management-system-61b3 origin/cursor/ppe-management-system-61b3 2>$null
    git pull origin cursor/ppe-management-system-61b3 2>$null
}

dir package.json

# Copy .env from apps/api (where it lives in this project)
if (Test-Path "apps/api/.env.example") {
    Copy-Item apps/api/.env.example apps/api/.env -Force
    Write-Host "Copied apps/api/.env.example to apps/api/.env"
} else {
    Write-Host "No .env.example found in apps/api - skipping"
}

npm install

# Prisma: generate client and run migrations (uses apps/api workspace)
npm exec -w apps/api -- prisma generate
npm exec -w apps/api -- prisma migrate deploy

# Seed runs automatically on API startup via db.js

npm run dev
