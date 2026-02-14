#!/usr/bin/env bash
# Run once after you have a Postgres DATABASE_URL.
# Usage: export DATABASE_URL="postgresql://..."; ./scripts/setup-postgres-tables.sh
#    or: ./scripts/setup-postgres-tables.sh  (will prompt for URL)

set -e
cd "$(dirname "$0")/.."

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is not set. Paste your Postgres connection string:"
  read -r DATABASE_URL
  export DATABASE_URL
fi

echo "Running prisma db push (schema: Postgres)..."
npx prisma db push --schema=apps/api/prisma/schema.postgresql.prisma
echo "Done. Tables are ready."
