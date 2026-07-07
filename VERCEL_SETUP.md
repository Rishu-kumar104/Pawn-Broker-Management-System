# Deploy to Vercel (Fresh Setup)

Follow these steps after deleting your old Vercel project.

## 1. Create a PostgreSQL database (do this first)

### Option A — Neon (recommended, free)

1. Open [https://neon.tech](https://neon.tech) and sign up.
2. Click **New Project**.
3. Copy the **connection string** (URI). It looks like:
   ```
   postgresql://neondb_owner:xxxxx@ep-xxxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Save this string — you will need it in step 3.

### Option B — Vercel Postgres

1. Create the Vercel project first (step 2).
2. In the project, go to **Storage → Create Database → Postgres**.
3. Connect it to your project. Vercel adds `DATABASE_URL` automatically.

---

## 2. Import project on Vercel

1. Go to [https://vercel.com/new](https://vercel.com/new).
2. Click **Import** next to `Rishu-kumar104/Pawn-Broker-Management-System`.
3. Framework should auto-detect as **Next.js**.
4. **Do not change** build settings:
   - Build Command: `npm run build`
   - Install Command: `npm install`
   - Output Directory: (leave default)
5. **Stop before Deploy** — add environment variable first (step 3).

---

## 3. Add environment variable

Before deploying, click **Environment Variables** and add:

| Name | Value | Environment |
|------|-------|-------------|
| `DATABASE_URL` | Your real Postgres connection string from step 1 | Production, Preview, Development |

**Important:** Use the real hostname from Neon/Supabase — **not** `HOST`, `USER`, or `PASSWORD` placeholders.

Example (Neon):
```
postgresql://neondb_owner:YOUR_PASSWORD@ep-cool-name-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

Then click **Deploy**.

---

## 4. Wait for build

The build will:

1. Install dependencies
2. Run `prisma generate`
3. Run `prisma db push` (creates tables in Postgres)
4. Build Next.js

If build succeeds, your app is live.

---

## 5. Test the app

1. Open your Vercel URL (e.g. `https://pawn-broker-management-system.vercel.app`).
2. Go to **Create Loan**.
3. Fill the form and submit.
4. If it works, you are done.

---

## 6. If Create Loan fails

| Error on screen | Fix |
|-----------------|-----|
| `Can't reach database server at HOST:5432` | `DATABASE_URL` still has placeholder `HOST` — replace with real Neon/Supabase URL |
| `DATABASE_URL is missing` | Add env var in Vercel → Settings → Environment Variables, then redeploy |
| `Database tables are missing` | Redeploy after fixing `DATABASE_URL` (build runs `prisma db push`) |
| `Authentication failed` | Wrong password in connection string |

After fixing env vars, go to **Deployments → Redeploy** (latest commit).

---

## 7. Optional — verify database locally

On your PC, in the project folder:

```powershell
$env:DATABASE_URL="paste-your-real-postgres-url"
npm run db:verify
```

This checks connection and creates tables.

---

## Quick checklist

- [ ] Postgres database created (Neon or Vercel Postgres)
- [ ] GitHub repo imported on Vercel
- [ ] `DATABASE_URL` set with **real** connection string
- [ ] Deploy succeeded (green checkmark)
- [ ] Create Loan works on live site
