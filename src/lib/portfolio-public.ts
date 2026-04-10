import { and, eq, gt, isNull, or } from 'drizzle-orm';

import { db } from '@/lib/db';
import { blogPosts, portfolios } from '@/lib/db/schema';
import { normalizePublicHandleInput, portfolioSiteBasePath } from '@/lib/public-handle';

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

/** Canonical public paths for published, non-expired portfolios (sitemap). */
export async function listPublishedPortfolioPathsForSitemap(): Promise<
  { path: string; lastModified: Date }[]
> {
  const rows = await db
    .select({
      slug: portfolios.slug,
      publicHandle: portfolios.publicHandle,
      updatedAt: portfolios.updatedAt,
    })
    .from(portfolios)
    .where(
      and(
        eq(portfolios.isPublished, true),
        or(isNull(portfolios.expiresAt), gt(portfolios.expiresAt, new Date())),
      ),
    );

  return rows.map((row) => ({
    path: portfolioSiteBasePath({ publicHandle: row.publicHandle, slug: row.slug }),
    lastModified: row.updatedAt,
  }));
}

/** Published blog posts on live portfolios (sitemap). */
export async function listPublishedBlogPostPathsForSitemap(): Promise<
  { path: string; lastModified: Date }[]
> {
  const rows = await db
    .select({
      slug: portfolios.slug,
      publicHandle: portfolios.publicHandle,
      postSlug: blogPosts.slug,
      updatedAt: blogPosts.updatedAt,
    })
    .from(blogPosts)
    .innerJoin(portfolios, eq(blogPosts.portfolioId, portfolios.id))
    .where(
      and(
        eq(blogPosts.isPublished, true),
        eq(portfolios.isPublished, true),
        or(isNull(portfolios.expiresAt), gt(portfolios.expiresAt, new Date())),
      ),
    );

  return rows.map((row) => ({
    path: `${portfolioSiteBasePath({ publicHandle: row.publicHandle, slug: row.slug })}/blog/${row.postSlug}`,
    lastModified: row.updatedAt,
  }));
}
