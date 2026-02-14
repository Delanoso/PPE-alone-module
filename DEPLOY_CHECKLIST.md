# Vercel deploy checklist

Do these in order. Tick as you go.

---

## Step 1: Create a Postgres database

Pick one provider and create a database. Then copy the **connection string** (URL).

| Provider | How to get the URL |
|----------|--------------------|
| **Vercel Postgres** | Vercel Dashboard → Storage → Create Database → Postgres → Connect → copy **`.env`** line or "Connection string" |
| **Neon** | [neon.tech](https://neon.tech) → New Project → copy connection string (e.g. `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`) |
| **Supabase** | [supabase.com](https://supabase.com) → New Project → Settings → Database → Connection string → URI (use the **Session mode** URI and add `?sslmode=require` if needed) |
| **Railway / Render / other** | Create a Postgres service and copy the `DATABASE_URL` or connection URI they give you |

Save it somewhere safe; you’ll use it in Step 3 and in Vercel.

---

## Step 2: Create tables (run once, from your machine)

Open a terminal in **PPE-alone-module** and run **one** of the following.

**Windows (PowerShell):**
```powershell
cd PPE-alone-module
$env:DATABASE_URL = "postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
npx prisma db push --schema=apps/api/prisma/schema.postgresql.prisma
```

**Windows (Command Prompt):**
```cmd
cd PPE-alone-module
set DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
npx prisma db push --schema=apps/api/prisma/schema.postgresql.prisma
```

**macOS / Linux:**
```bash
cd PPE-alone-module
export DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
npx prisma db push --schema=apps/api/prisma/schema.postgresql.prisma
```

Replace the URL with your real connection string. When it finishes, tables are ready.

---

## Step 3: Import the project in Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (GitHub recommended).
2. Click **Add New…** → **Project**.
3. **Import** the repo that contains this code:
   - If you deploy **only** the app: import **PPE-alone-module** (or the repo that has `vercel.json` and `apps/`).
   - If you deploy the **parent** repo (ppe-stand-alone): import that repo, then set **Root Directory** to **`PPE-alone-module`** and save.
4. Leave **Framework Preset** as “Other” (or let Vercel detect; we use custom build).
5. **Do not** click Deploy yet; add env vars first (Step 4).

---

## Step 4: Set environment variables in Vercel

In the same screen (or **Settings → Environment Variables** for the project), add:

| Name | Value | Where |
|------|--------|------|
| `DATABASE_URL` | Your full Postgres URL from Step 1 | Production (and Preview if you use branches) |
| `JWT_SECRET` | A long random string (e.g. from [randomkeygen.com](https://randomkeygen.com)) | Production (and Preview if needed) |
| `PUBLIC_URL` | `https://YOUR-PROJECT.vercel.app` (or your custom domain later) | Optional; for sign/size links in messages |

Then click **Deploy**.

---

## Step 5: Deploy and test

- Wait for the build to finish.
- Open **https://YOUR-PROJECT.vercel.app**.
- Log in with e.g. **admin** / **admin123** (first request may be slower while the DB is seeded).

---

## Quick reference

- **Tables:** Step 2 (once per database).
- **Vercel:** Step 3 (import) + Step 4 (env) + Deploy.
- **Local dev:** Still uses SQLite; no change.

For more detail, see **VERCEL_DEPLOY.md**.
