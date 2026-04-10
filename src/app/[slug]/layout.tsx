import type { ReactNode } from 'react';
import { eq } from 'drizzle-orm';

import { PortfolioPublicShell } from '@/components/domain/portfolio-public-shell';
import { db } from '@/lib/db';
import { portfolios } from '@/lib/db/schema';

export default async function PublicPortfolioSlugLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { slug: string };
}) {
  const row = await db
    .select({ accentColor: portfolios.accentColor })
    .from(portfolios)
    .where(eq(portfolios.slug, params.slug))
    .get();

  return (
    <PortfolioPublicShell accentColor={row?.accentColor ?? null}>{children}</PortfolioPublicShell>
  );
}
