import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { and, eq } from 'drizzle-orm';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { PortfolioAmbientBg } from '@/components/domain/portfolio-ambient';
import { PortfolioPublicFooter } from '@/components/domain/portfolio-public-footer';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { db } from '@/lib/db';
import { blogPosts } from '@/lib/db/schema';
import {
  portfolioContentContainerClass,
  portfolioEyebrowClass,
  portfolioHeaderRuleClass,
  portfolioNavPillClass,
  portfolioReadingColumnClass,
  portfolioShellClass,
} from '@/lib/portfolio-public-ui';
import { getPublishedPortfolioBySlug } from '@/lib/portfolio-public';
import { cn } from '@/lib/utils';

interface Props {
  params: { slug: string; postSlug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const portfolio = await getPublishedPortfolioBySlug(params.slug);
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

export default async function BlogPostPage({ params }: Props) {
  const portfolio = await getPublishedPortfolioBySlug(params.slug);
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

  const neu = portfolio.theme === 'neubrutalism';

  return (
    <div className={portfolioShellClass(neu)}>
      {!neu && <PortfolioAmbientBg />}
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      <article className={cn('portfolio-surface', portfolioContentContainerClass())}>
        <div className={portfolioReadingColumnClass()}>
          <Link href={`/${params.slug}/blog`} className={portfolioNavPillClass(neu)}>
            ← All posts
          </Link>

          <header className={cn('mt-10', portfolioHeaderRuleClass(neu))}>
            <p className={portfolioEyebrowClass(neu)}>Post</p>
            <h1
              className={cn(
                'mt-3 font-display text-[clamp(1.75rem,3vw+1rem,2.75rem)] font-semibold leading-tight tracking-tight',
                neu && 'uppercase',
              )}
            >
              {post.title}
            </h1>
            {post.publishedAt && (
              <p className="mt-4 text-sm font-medium tabular-nums text-muted-foreground">
                {new Date(post.publishedAt).toLocaleDateString(undefined, {
                  dateStyle: 'long',
                })}
              </p>
            )}
          </header>

          <div
            className={cn(
              'prose prose-neutral prose-lg dark:prose-invert mt-12 max-w-none',
              'prose-headings:font-sans prose-headings:tracking-tight',
              neu &&
                'prose-headings:uppercase prose-a:font-bold prose-a:text-foreground prose-a:no-underline',
            )}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
          </div>

          <PortfolioPublicFooter neu={neu} label="Blog" />
        </div>
      </article>
    </div>
  );
}
