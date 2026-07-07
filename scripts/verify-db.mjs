import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile() {
  if (process.env.DATABASE_URL) return;

  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^\s*DATABASE_URL\s*=\s*(.+?)\s*$/);
    if (match) {
      process.env.DATABASE_URL = match[1].replace(/^["']|["']$/g, "");
      return;
    }
  }
}

loadEnvFile();

const databaseUrl = process.env.DATABASE_URL ?? "";

function fail(message) {
  console.error(`\n❌ ${message}\n`);
  process.exit(1);
}

function ok(message) {
  console.log(`✅ ${message}`);
}

if (!databaseUrl) {
  fail("DATABASE_URL is missing. Copy .env.example to .env and set a real Postgres URL.");
}

const isPostgres =
  databaseUrl.startsWith("postgresql://") ||
  databaseUrl.startsWith("postgres://");

if (!isPostgres) {
  fail(
    `DATABASE_URL must be a Postgres URL. Current value starts with: ${databaseUrl.slice(0, 20)}...`
  );
}

const looksLikePlaceholder =
  databaseUrl.includes("@HOST:") ||
  databaseUrl.includes("USER:PASSWORD@") ||
  databaseUrl.includes("/DATABASE?") ||
  databaseUrl.includes("/DATABASE\"");

if (looksLikePlaceholder) {
  fail(
    "DATABASE_URL still uses placeholder values (HOST, USER, PASSWORD, DATABASE). Replace them with values from Neon, Supabase, or Vercel Postgres."
  );
}

try {
  const hostMatch = databaseUrl.match(/@([^/:?]+)/);
  const host = hostMatch?.[1] ?? "unknown";
  ok(`DATABASE_URL format looks valid (host: ${host})`);
} catch {
  fail("DATABASE_URL format is invalid.");
}

console.log("\nRunning prisma generate...");
execSync("npx prisma generate", { stdio: "inherit" });
ok("Prisma client generated");

console.log("\nChecking database connection (prisma db pull)...");
try {
  execSync("npx prisma db pull --force", { stdio: "inherit" });
  ok("Database is reachable");
} catch {
  fail(
    "Cannot reach database server. Check hostname, password, sslmode=require, and that the database is running."
  );
}

console.log("\nPushing schema to database...");
try {
  execSync("npx prisma db push", { stdio: "inherit" });
  ok("Schema synced with database");
} catch {
  fail("prisma db push failed. Fix DATABASE_URL and try again.");
}

console.log("\nAll database checks passed.\n");
