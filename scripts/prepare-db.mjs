import { execSync } from "node:child_process";

const databaseUrl = process.env.DATABASE_URL ?? "";
const isPostgres =
  databaseUrl.startsWith("postgresql://") ||
  databaseUrl.startsWith("postgres://");

const looksLikePlaceholder =
  databaseUrl.includes("@HOST:") ||
  databaseUrl.includes("USER:PASSWORD@") ||
  databaseUrl.includes("/DATABASE") ||
  databaseUrl.includes("YOUR_REAL_HOST") ||
  databaseUrl.includes("YOUR_PASSWORD") ||
  databaseUrl.includes("YOUR_USER");

if (!isPostgres) {
  console.warn(
    "Skipping prisma db push: DATABASE_URL is missing or not a Postgres URL."
  );
  console.warn("Set a real Postgres DATABASE_URL in Vercel project settings.");
  process.exit(0);
}

if (looksLikePlaceholder) {
  console.warn(
    "Skipping prisma db push: DATABASE_URL still uses placeholder values (HOST/USER/PASSWORD/DATABASE)."
  );
  console.warn(
    "Replace it with your real connection string from Neon, Supabase, or Vercel Postgres."
  );
  process.exit(0);
}

console.log("Running prisma db push against Postgres...");

try {
  execSync("npx prisma db push --skip-generate", { stdio: "inherit" });
} catch {
  console.warn(
    "prisma db push failed during build. Deployment will continue, but create-loan may fail until the database is reachable."
  );
  console.warn("After fixing DATABASE_URL, redeploy or run: npx prisma db push");
  process.exit(0);
}
