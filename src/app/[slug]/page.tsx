import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { and, eq, sql } from 'drizzle-orm';

import { PortfolioContentView } from '@/components/domain/portfolio-content-view';
import { db } from '@/lib/db';
import { blogPosts, integrations } from '@/lib/db/schema';
import { getPublishedPortfolioBySlug } from '@/lib/portfolio-public';
import { integrationToSocialLink } from '@/lib/social-links';
import { logPortfolioView, parseViewHeaders } from '@/lib/view-log';
import type { PortfolioContent } from '@/types';

interface PortfolioPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PortfolioPageProps): Promise<Metadata> {
  const portfolio = await getPublishedPortfolioBySlug(params.slug);

  if (!portfolio) {
    return {
      title: 'Portfolio not found',
      description: 'This portfolio could not be found.',
    };
  }

  return {
    title: portfolio.title,
    description: `Professional portfolio for ${portfolio.title}`,
  };
}

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const { slug } = params;

  const portfolio = await getPublishedPortfolioBySlug(slug);

  if (!portfolio) {
    return notFound();
  }

  const headerList = headers();
  await logPortfolioView(
    portfolio.id,
    parseViewHeaders((name) => headerList.get(name)),
  );

  const content = portfolio.content as unknown as PortfolioContent;

  const integrationRows = await db
    .select()
    .from(integrations)
    .where(eq(integrations.userId, portfolio.userId));

  const socialLinks = integrationRows
    .map((r) => integrationToSocialLink(r.platform, r.username, r.data as Record<string, unknown> | null))
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const blogCountRow = await db
    .select({ c: sql<number>`count(*)` })
    .from(blogPosts)
    .where(and(eq(blogPosts.portfolioId, portfolio.id), eq(blogPosts.isPublished, true)))
    .get();

  const showBlog = (blogCountRow?.c ?? 0) > 0;

  return (
    <PortfolioContentView
      content={content}
      slug={slug}
      theme={portfolio.theme}
      showBlogLink={showBlog}
      socialLinks={socialLinks}
    />
  );
}
