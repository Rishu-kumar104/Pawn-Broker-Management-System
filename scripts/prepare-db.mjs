import { execSync } from "node:child_process";

const databaseUrl = process.env.DATABASE_URL ?? "";
const isPostgres =
  databaseUrl.startsWith("postgresql://") ||
  databaseUrl.startsWith("postgres://");

if (!isPostgres) {
  console.warn(
    "Skipping prisma db push: DATABASE_URL is missing or not a Postgres URL."
  );
  console.warn(
    "Set DATABASE_URL in Vercel, then run: npx prisma db push"
  );
  process.exit(0);
}

console.log("Running prisma db push against Postgres...");
execSync("npx prisma db push --skip-generate", { stdio: "inherit" });
