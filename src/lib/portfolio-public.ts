import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { portfolios } from '@/lib/db/schema';
import { normalizePublicHandleInput } from '@/lib/public-handle';

export type PublicPortfolioRow = typeof portfolios.$inferSelect;

function isPortfolioPubliclyVisible(portfolio: PublicPortfolioRow | undefined): portfolio is PublicPortfolioRow {
  if (!portfolio || !portfolio.isPublished) return false;
  if (portfolio.expiresAt && portfolio.expiresAt < new Date()) return false;
  return true;
}

export async function getPublishedPortfolioBySlug(
  slug: string,
): Promise<PublicPortfolioRow | null> {
  const portfolio = await db.select().from(portfolios).where(eq(portfolios.slug, slug)).get();
  return isPortfolioPubliclyVisible(portfolio) ? portfolio : null;
}

export async function getPublishedPortfolioByPublicHandle(
  handle: string,
): Promise<PublicPortfolioRow | null> {
  const normalized = normalizePublicHandleInput(handle);
  if (!normalized) return null;
  const portfolio = await db
    .select()
    .from(portfolios)
    .where(eq(portfolios.publicHandle, normalized))
    .get();
  return isPortfolioPubliclyVisible(portfolio) ? portfolio : null;
}
