import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { PortfolioPublicHome } from '@/components/domain/portfolio-public-home';
import { getPublishedPortfolioByPublicHandle } from '@/lib/portfolio-public';
import { normalizePublicHandleInput } from '@/lib/public-handle';

interface Props {
  params: { handle: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const normalized = normalizePublicHandleInput(params.handle);
  const portfolio = normalized ? await getPublishedPortfolioByPublicHandle(normalized) : null;

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

export default async function PortfolioByHandlePage({ params }: Props) {
  const normalized = normalizePublicHandleInput(params.handle);
  if (!normalized) {
    return notFound();
  }

  const portfolio = await getPublishedPortfolioByPublicHandle(normalized);
  if (!portfolio) {
    return notFound();
  }

  const siteBasePath = `/u/${portfolio.publicHandle}`;

  return (
    <PortfolioPublicHome
      portfolio={portfolio}
      siteBasePath={siteBasePath}
      displaySlug={portfolio.publicHandle ?? portfolio.slug}
    />
  );
}
