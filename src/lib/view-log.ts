import { nanoid } from 'nanoid';
import { and, eq, gte, isNull, sql } from 'drizzle-orm';

import { db } from '@/lib/db';
import { viewLogs } from '@/lib/db/schema';

function classifyDevice(userAgent: string | null): string | null {
  if (!userAgent) return null;
  const u = userAgent.toLowerCase();
  if (/tablet|ipad|playbook|silk|(android(?!.*mobile))/.test(u)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/.test(u)) return 'mobile';
  return 'desktop';
}

function isProbablyBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  // Common crawlers / link unfurlers / performance scanners
  return /bot|crawl|spider|slurp|facebookexternal|embedly|quora|preview|whatsapp|telegrambot|discordbot|slackbot|twitterbot|linkedinbot|pinterest|google-extended|bingpreview|yandex|duckduckbot|ahrefs|semrush|mj12bot|dotbot|siteaudit|lighthouse|pagespeed|headlesschrome|prerender|uptimerobot|pingdom|datadog|newrelic|sentry|statuscake/i.test(
    ua,
  );
}

function normalizeReferrer(referrer: string | null): string | null {
  if (!referrer) return null;
  const r = referrer.trim();
  if (!r) return null;
  try {
    const u = new URL(r);
    // Keep origin only to reduce churn in breakdowns and improve dedupe signal.
    return u.origin;
  } catch {
    return r;
  }
}

export interface ViewLogHeaders {
  referrer: string | null;
  userAgent: string | null;
  country: string | null;
}

function normalizeCountryCode(input: string | null): string | null {
  if (!input) return null;
  const raw = input.trim();
  if (!raw) return null;
  const upper = raw.toUpperCase();
  // Common sentinels
  if (upper === 'XX' || upper === 'ZZ' || upper === 'UNKNOWN' || upper === 'N/A') return null;
  // Some providers may send 'US,CA' or similar; pick first token
  const token = upper.split(/[,\s;]/).filter(Boolean)[0] ?? '';
  if (!token) return null;
  // ISO 3166-1 alpha-2 country codes are 2 letters.
  if (/^[A-Z]{2}$/.test(token)) return token;
  return null;
}

export function parseViewHeaders(getHeader: (name: string) => string | null): ViewLogHeaders {
  const country =
    normalizeCountryCode(getHeader('x-vercel-ip-country')) ||
    normalizeCountryCode(getHeader('cf-ipcountry')) ||
    normalizeCountryCode(getHeader('fly-client-country')) ||
    normalizeCountryCode(getHeader('x-country-code')) ||
    normalizeCountryCode(getHeader('x-geo-country')) ||
    normalizeCountryCode(getHeader('x-appengine-country')) ||
    null;

  return {
    referrer: normalizeReferrer(getHeader('referer')),
    userAgent: getHeader('user-agent'),
    country,
  };
}

export async function logPortfolioView(portfolioId: string, headers: ViewLogHeaders): Promise<void> {
  const ua = headers.userAgent;
  if (isProbablyBot(ua)) return;

  // Dedupe repeated hits (refreshes/prefetch loops) without IP storage.
  // Default 5 minutes; set VIEW_DEDUPE_SECONDS=0 to disable.
  const dedupeSeconds = Number(process.env.VIEW_DEDUPE_SECONDS ?? '300');
  if (Number.isFinite(dedupeSeconds) && dedupeSeconds > 0) {
    const since = new Date(Date.now() - dedupeSeconds * 1000);
    const ref = headers.referrer ?? null;
    const existing = await db
      .select({ n: sql<number>`count(*)` })
      .from(viewLogs)
      .where(
        and(
          eq(viewLogs.portfolioId, portfolioId),
          gte(viewLogs.viewedAt, since),
          ua ? eq(viewLogs.userAgent, ua) : isNull(viewLogs.userAgent),
          ref ? eq(viewLogs.referrer, ref) : isNull(viewLogs.referrer),
        ),
      )
      .get();
    if ((existing?.n ?? 0) > 0) return;
  }

  await db.insert(viewLogs).values({
    id: nanoid(16),
    portfolioId,
    referrer: headers.referrer ?? undefined,
    userAgent: ua ?? undefined,
    country: headers.country ?? undefined,
    device: classifyDevice(ua),
  });
}
