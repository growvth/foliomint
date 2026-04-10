import type { ReactNode } from 'react';
import { eq } from 'drizzle-orm';

import { PortfolioPublicShell } from '@/components/domain/portfolio-public-shell';
import { db } from '@/lib/db';
import { portfolios } from '@/lib/db/schema';
import { normalizePublicHandleInput } from '@/lib/public-handle';

export default async function PublicPortfolioHandleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { handle: string };
}) {
  const normalized = normalizePublicHandleInput(params.handle);
  const row = normalized
    ? await db
        .select({ accentColor: portfolios.accentColor })
        .from(portfolios)
        .where(eq(portfolios.publicHandle, normalized))
        .get()
    : undefined;

  return (
    <PortfolioPublicShell accentColor={row?.accentColor ?? null}>{children}</PortfolioPublicShell>
  );
}
