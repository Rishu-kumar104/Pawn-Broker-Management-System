# Vercel + PostgreSQL Deployment Guide

This app requires a **real hosted PostgreSQL** database. SQLite and placeholder URLs will not work on Vercel.

## Step 1: Create a PostgreSQL database

Choose one provider:

### Neon (recommended, free tier)

1. Go to [https://neon.tech](https://neon.tech) and create a project.
2. Open **Dashboard → Connection Details**.
3. Copy the **connection string** (URI format).

Example:

```env
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-cool-tree-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
```

### Supabase

1. Create a project at [https://supabase.com](https://supabase.com).
2. Go to **Settings → Database → Connection string (URI)**.
3. Copy the URI.

Example:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres?sslmode=require"
```

### Vercel Postgres

1. In your Vercel project, open **Storage**.
2. Create a **Postgres** database and connect it to the project.
3. Vercel will add `DATABASE_URL` automatically.

---

## Step 2: Set environment variables

### Local development

```bash
cp .env.example .env
```

Edit `.env` and paste your **real** connection string.

**Wrong (placeholder — do not use):**

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
```

**Wrong (SQLite — does not work on Vercel):**

```env
DATABASE_URL="file:./dev.db"
```

### Vercel production

1. Vercel → **Project → Settings → Environment Variables**
2. Add:
   - **Name:** `DATABASE_URL`
   - **Value:** your real Postgres connection string
   - **Environment:** Production (and Preview if needed)
3. Save and redeploy.

---

## Step 3: Generate Prisma client

```bash
npm install
npx prisma generate
```

---

## Step 4: Verify database and create tables

Run the full check:

```bash
npm run db:verify
```

Or manually:

```bash
npx prisma db push
```

This creates the `Loan`, `Payment`, and `Journal` tables in Postgres.

---

## Step 5: Deploy on Vercel

1. Push code to GitHub (`main` branch).
2. Vercel auto-deploys, or click **Redeploy**.
3. Ensure the latest deployment is **Promoted to Production** (not rolled back).

During build, the app runs `scripts/prepare-db.mjs` which syncs the schema when `DATABASE_URL` is a valid Postgres URL.

---

## Step 6: Test the app

1. Open your Vercel URL.
2. Go to **Create Loan** and submit a test loan.
3. If it fails, read the error message on screen — it usually indicates:
   - missing `DATABASE_URL`
   - placeholder URL still in use
   - database unreachable
   - tables not created yet

---

## Troubleshooting

| Error | Fix |
|---|---|
| `Can't reach database server at HOST:5432` | Replace placeholder `HOST` with real hostname from your DB provider |
| `Environment variable not found: DATABASE_URL` | Add `DATABASE_URL` in Vercel settings |
| `Database tables are missing` | Run `npm run db:verify` or redeploy after fixing `DATABASE_URL` |
| `Authentication failed` | Check username/password in connection string |
| Build fails on `prisma db push` | Ensure `DATABASE_URL` is real and database allows external connections |

---

## Quick command reference

```bash
npx prisma generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:verify        # Validate URL, test connection, push schema
npm run build            # Production build (used by Vercel)
```
