import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { portfolios } from '@/lib/db/schema';

export type PublicPortfolioRow = typeof portfolios.$inferSelect;

export async function getPublishedPortfolioBySlug(
  slug: string,
): Promise<PublicPortfolioRow | null> {
  const portfolio = await db.select().from(portfolios).where(eq(portfolios.slug, slug)).get();

  if (!portfolio || !portfolio.isPublished) {
    return null;
  }

  if (portfolio.expiresAt && portfolio.expiresAt < new Date()) {
    return null;
  }

  return portfolio;
}
