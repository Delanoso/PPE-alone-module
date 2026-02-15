# Deploying to Vercel

This project is set up to run **fully** on Vercel: the **web app** is built and served as static files (with SPA routing), and the **API** runs as a single serverless function. You need a **PostgreSQL** database (Vercel does not support SQLite in serverless).

**What works on Vercel:** Login, dashboard, people, departments, PPE catalog, stock, issuing, signatures, size requests, reminders, reports, audit, and people import (Excel upload). The app seeds the database on first request.

## 1. Create a PostgreSQL database

Use one of:

- **[Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)** (in the same project)
- **[Neon](https://neon.tech)** (free tier)
- **[Supabase](https://supabase.com)** (free tier)
- Any other Postgres host

Copy the **connection string** (e.g. `postgresql://user:pass@host:5432/dbname?sslmode=require`).

## 2. Create the database tables

With the Postgres URL set as `DATABASE_URL`, run from the **PPE-alone-module** root:

```bash
cd PPE-alone-module
set DATABASE_URL=postgresql://...
npx prisma db push --schema=apps/api/prisma/schema.postgresql.prisma
```

(On macOS/Linux use `export DATABASE_URL=...`.)

This creates all tables. The app will seed demo data on the first API request.

## 3. Deploy to Vercel

**Option A – Deploy from the PPE-alone-module repo**

1. Push the code to GitHub (e.g. the `PPE-alone-module` repo).
2. Go to [vercel.com](https://vercel.com) → **Add New** → **Project** → import the repo.
3. **Root Directory:** leave default (or set to the repo root).
4. **Build and Output:** should be picked up from `vercel.json` (build command and `apps/web/dist`).
5. Add **Environment Variables** (see below).
6. Deploy.

**Option B – Deploy from the parent repo (ppe-stand-alone)**

1. In Vercel, import the **ppe-stand-alone** repo.
2. Set **Root Directory** to **PPE-alone-module** (the submodule folder).
3. Add environment variables.
4. Deploy. (Ensure the submodule is checked out in your CI/Vercel build.)

## 4. Environment variables (Vercel)

In the Vercel project → **Settings** → **Environment Variables**, add:

| Name           | Value                    | Notes |
|----------------|---------------------------|--------|
| `DATABASE_URL` | `postgresql://...`        | **Required.** Your Postgres connection string (with `?sslmode=require` if needed). |
| `JWT_SECRET`   | (random secret string)    | **Recommended.** Use a long random string for production. |
| `PUBLIC_URL`   | `https://your-app.vercel.app` | Optional. Used for sign/size links in WhatsApp messages; set to your Vercel app URL. |

Do **not** set `VITE_API_BASE` for production: the frontend uses the same origin (`/api`) by default.

## 5. After deploy

- Open `https://your-project.vercel.app` – you should see the login page.
- Demo logins: `admin` / `admin123`, `manager` / `manager123`, `stores` / `stores123`.
- The first request may be slower while the DB is seeded.

## Troubleshooting

- **Build fails on Prisma**  
  Ensure **Root Directory** includes `apps/api` and that `build:vercel` runs (it runs `prisma generate` with the Postgres schema).

- **API returns 500**  
  Check **Vercel → Project → Logs** and that `DATABASE_URL` is set and correct. Ensure you ran `prisma db push` with the Postgres schema so tables exist.

- **CORS or “Failed to fetch”**  
  The app is designed to use the same origin (no `VITE_API_BASE`). If you use a custom domain, set `PUBLIC_URL` to that domain.

- **Local dev unchanged**  
  Local development still uses **SQLite** and `schema.prisma`. Only the Vercel build uses `schema.postgresql.prisma` and Postgres.
