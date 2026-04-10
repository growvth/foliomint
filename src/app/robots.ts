import type { MetadataRoute } from 'next';

function baseUrl(): string {
  return (
    process.env.NEXTAUTH_URL?.replace(/\/$/, '') ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ??
    'http://localhost:3000'
  );
}

export default function robots(): MetadataRoute.Robots {
  const root = baseUrl();
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/editor/', '/generate', '/api/'],
    },
    sitemap: `${root}/sitemap.xml`,
  };
}
