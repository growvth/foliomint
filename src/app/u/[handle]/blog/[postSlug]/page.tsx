import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { and, eq } from 'drizzle-orm';

import { PortfolioBlogPost } from '@/components/domain/portfolio-blog-post';
import { db } from '@/lib/db';
import { blogPosts } from '@/lib/db/schema';
import { getPublishedPortfolioByPublicHandle } from '@/lib/portfolio-public';
import { normalizePublicHandleInput } from '@/lib/public-handle';

interface Props {
  params: { handle: string; postSlug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const normalized = normalizePublicHandleInput(params.handle);
  const portfolio = normalized ? await getPublishedPortfolioByPublicHandle(normalized) : null;
  if (!portfolio) {
    return { title: 'Not found' };
  }

  const post = await db
    .select({ title: blogPosts.title })
    .from(blogPosts)
    .where(
      and(
        eq(blogPosts.portfolioId, portfolio.id),
        eq(blogPosts.slug, params.postSlug),
        eq(blogPosts.isPublished, true),
      ),
    )
    .get();

  if (!post) {
    return { title: 'Post not found' };
  }

  return {
    title: `${post.title} — ${portfolio.title}`,
  };
}

export default async function BlogPostByHandlePage({ params }: Props) {
  const normalized = normalizePublicHandleInput(params.handle);
  if (!normalized) {
    return notFound();
  }
  const portfolio = await getPublishedPortfolioByPublicHandle(normalized);
  if (!portfolio) {
    return notFound();
  }

  const post = await db
    .select()
    .from(blogPosts)
    .where(
      and(
        eq(blogPosts.portfolioId, portfolio.id),
        eq(blogPosts.slug, params.postSlug),
        eq(blogPosts.isPublished, true),
      ),
    )
    .get();

  if (!post) {
    return notFound();
  }

  return (
    <PortfolioBlogPost portfolio={portfolio} post={post} siteBasePath={`/u/${portfolio.publicHandle}`} />
  );
}
