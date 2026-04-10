import type { MetadataRoute } from 'next';

import {
  listPublishedBlogPostPathsForSitemap,
  listPublishedPortfolioPathsForSitemap,
} from '@/lib/portfolio-public';

/** Avoid static prerender hitting DB during `next build` when DB/network is unavailable. */
export const dynamic = 'force-dynamic';

function siteBase(): string {
  const explicit = process.env.NEXTAUTH_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, '');
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, '');
    return `https://${host}`;
  }
  return 'http://localhost:3000';
}

function absoluteUrl(path: string): string {
  const base = siteBase();
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = ['/', '/pricing'].map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: 'weekly',
    priority: path === '/' ? 1 : 0.8,
  }));

  let portfolioEntries: MetadataRoute.Sitemap = [];
  let blogEntries: MetadataRoute.Sitemap = [];

  try {
    const [portfolioPaths, blogPostPaths] = await Promise.all([
      listPublishedPortfolioPathsForSitemap(),
      listPublishedBlogPostPathsForSitemap(),
    ]);

    portfolioEntries = portfolioPaths.map(({ path, lastModified }) => ({
      url: absoluteUrl(path),
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    blogEntries = blogPostPaths.map(({ path, lastModified }) => ({
      url: absoluteUrl(path),
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));
  } catch {
    // DB unreachable (e.g. build without DB) — still ship core URLs.
  }

  return [...staticPages, ...portfolioEntries, ...blogEntries];
}
