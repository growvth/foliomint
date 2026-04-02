import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { and, desc, eq } from 'drizzle-orm';

import { PortfolioAmbientBg } from '@/components/domain/portfolio-ambient';
import { PortfolioPublicFooter } from '@/components/domain/portfolio-public-footer';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { db } from '@/lib/db';
import { blogPosts } from '@/lib/db/schema';
import {
  PORTFOLIO_CARD_PAD,
  portfolioCardClass,
  portfolioContentContainerClass,
  portfolioDateTextClass,
  portfolioEyebrowClass,
  portfolioHeaderRuleClass,
  portfolioNavPillClass,
  portfolioSectionAccentClass,
  portfolioShellClass,
} from '@/lib/portfolio-public-ui';
import { getPublishedPortfolioBySlug } from '@/lib/portfolio-public';
import { cn } from '@/lib/utils';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const portfolio = await getPublishedPortfolioBySlug(params.slug);
  if (!portfolio) {
    return { title: 'Not found' };
  }
  return {
    title: `Blog — ${portfolio.title}`,
    description: `Posts from ${portfolio.title}`,
  };
}

export default async function BlogIndexPage({ params }: Props) {
  const portfolio = await getPublishedPortfolioBySlug(params.slug);
  if (!portfolio) {
    return notFound();
  }

  const neu = portfolio.theme === 'neubrutalism';

  const posts = await db
    .select({
      title: blogPosts.title,
      slug: blogPosts.slug,
      excerpt: blogPosts.excerpt,
      publishedAt: blogPosts.publishedAt,
    })
    .from(blogPosts)
    .where(and(eq(blogPosts.portfolioId, portfolio.id), eq(blogPosts.isPublished, true)))
    .orderBy(desc(blogPosts.publishedAt));

  const card = portfolioCardClass(neu);

  return (
    <div className={portfolioShellClass(neu)}>
      {!neu && <PortfolioAmbientBg />}
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      <div className={cn('portfolio-surface', portfolioContentContainerClass())}>
        <Link href={`/${params.slug}`} className={portfolioNavPillClass(neu)}>
          ← Back to portfolio
        </Link>

        <header className={cn('mt-10', portfolioHeaderRuleClass(neu))}>
          <p className={portfolioEyebrowClass(neu)}>Writing</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className={portfolioSectionAccentClass(neu)} aria-hidden />
            <h1
              className={cn(
                'font-display text-4xl font-semibold tracking-tight lg:text-5xl',
                neu && 'uppercase tracking-wider',
              )}
            >
              Blog
            </h1>
          </div>
          <p className="mt-4 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">{portfolio.title}</p>
        </header>

        <ul className="mt-12 space-y-5">
          {posts.length === 0 ? (
            <li className="text-sm text-muted-foreground">No posts yet.</li>
          ) : (
            posts.map((p) => (
              <li key={p.slug}>
                <Link href={`/${params.slug}/blog/${p.slug}`} className={cn('group block', card, PORTFOLIO_CARD_PAD)}>
                  <h2 className="text-lg font-semibold group-hover:text-primary">{p.title}</h2>
                  {p.excerpt && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.excerpt}</p>}
                  {p.publishedAt && (
                    <p className={cn('mt-3', portfolioDateTextClass())}>
                      {new Date(p.publishedAt).toLocaleDateString()}
                    </p>
                  )}
                </Link>
              </li>
            ))
          )}
        </ul>

        <PortfolioPublicFooter neu={neu} label="Blog" />
      </div>
    </div>
  );
}
