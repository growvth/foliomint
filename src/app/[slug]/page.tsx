import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';

import { PortfolioPublicHome } from '@/components/domain/portfolio-public-home';
import { getPublishedPortfolioBySlug } from '@/lib/portfolio-public';
import { portfolioSiteBasePath } from '@/lib/public-handle';

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

  if (portfolio.publicHandle) {
    permanentRedirect(`/u/${portfolio.publicHandle}`);
  }

  const siteBasePath = portfolioSiteBasePath(portfolio);

  return (
    <PortfolioPublicHome
      portfolio={portfolio}
      siteBasePath={siteBasePath}
      displaySlug={slug}
    />
  );
}
