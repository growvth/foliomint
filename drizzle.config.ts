import type { Config } from 'drizzle-kit';

const isProd = process.env.NODE_ENV === 'production';

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  ...(isProd
    ? {
        driver: 'turso',
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
