import type { Config } from 'drizzle-kit';
import { existsSync, readFileSync } from 'node:fs';

function loadSimpleEnvFile(path: string) {
  if (!existsSync(path)) return;
  const text = readFileSync(path, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    // Handle common .env quoting (`KEY="value"` / `KEY='value'`).
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    // Keep explicit shell env (inline exports) highest priority.
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

// Load base env first, then local overrides (same precedence users expect).
loadSimpleEnvFile('.env');
loadSimpleEnvFile('.env.local');

const isProd = process.env.NODE_ENV === 'production';

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: isProd ? 'turso' : 'sqlite',
  ...(isProd
    ? {
        dbCredentials: {
          url: process.env.TURSO_DATABASE_URL!,
          authToken: process.env.TURSO_AUTH_TOKEN!,
        },
      }
    : {
        dbCredentials: {
          url: process.env.DATABASE_URL ?? 'file:./data/dev.db',
        },
      }),
} satisfies Config;
