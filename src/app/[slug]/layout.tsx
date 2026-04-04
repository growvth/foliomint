import type { ReactNode } from 'react';
import { eq } from 'drizzle-orm';

import { PortfolioPublicShell } from '@/components/domain/portfolio-public-shell';
import { ThemeToggle } from '@/components/ui/theme-toggle';
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
    <PortfolioPublicShell accentColor={row?.accentColor ?? null}>
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle className="border border-zinc-300/90 bg-white/90 text-zinc-800 shadow-sm hover:bg-zinc-100 dark:border-zinc-700/80 dark:bg-zinc-900/90 dark:text-zinc-200 dark:shadow-none dark:hover:bg-zinc-800 dark:hover:text-zinc-50" />
      </div>
      {children}
    </PortfolioPublicShell>
  );
}
