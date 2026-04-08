import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { PortfolioBlogIndex } from '@/components/domain/portfolio-blog-index';
import { getPublishedPortfolioByPublicHandle } from '@/lib/portfolio-public';
import { normalizePublicHandleInput } from '@/lib/public-handle';

interface Props {
  params: { handle: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const normalized = normalizePublicHandleInput(params.handle);
  const portfolio = normalized ? await getPublishedPortfolioByPublicHandle(normalized) : null;
  if (!portfolio) {
    return { title: 'Not found' };
  }
  return {
    title: `Blog — ${portfolio.title}`,
    description: `Posts from ${portfolio.title}`,
  };
}

export default async function BlogIndexByHandlePage({ params }: Props) {
  const normalized = normalizePublicHandleInput(params.handle);
  if (!normalized) {
    return notFound();
  }
  const portfolio = await getPublishedPortfolioByPublicHandle(normalized);
  if (!portfolio) {
    return notFound();
  }

  return <PortfolioBlogIndex portfolio={portfolio} siteBasePath={`/u/${portfolio.publicHandle}`} />;
}
