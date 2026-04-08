import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';

import { PortfolioBlogIndex } from '@/components/domain/portfolio-blog-index';
import { getPublishedPortfolioBySlug } from '@/lib/portfolio-public';

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
  if (portfolio.publicHandle) {
    permanentRedirect(`/u/${portfolio.publicHandle}/blog`);
  }

  return <PortfolioBlogIndex portfolio={portfolio} siteBasePath={`/${params.slug}`} />;
}
