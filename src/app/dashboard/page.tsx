import { redirect } from 'next/navigation';
import { and, eq, sql } from 'drizzle-orm';

import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { integrations, portfolios, users, viewLogs } from '@/lib/db/schema';
import { isPaymentGatingBypassed } from '@/lib/feature-flags';
import { Navbar } from '@/components/domain/navbar';
import { DashboardOverview } from '@/components/domain/dashboard-overview';

type DashboardPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function firstString(v: string | string[] | undefined): string | undefined {
  if (typeof v === 'string') return v;
  if (Array.isArray(v) && v[0]) return v[0];
  return undefined;
}

type PlanVariant = 'free' | 'pro' | 'pro_issue' | 'preview';

function getPlanDisplay(
  bypass: boolean,
  sub: string | null | undefined,
): { name: string; detail: string; variant: PlanVariant } {
  if (bypass) {
    if (process.env.NODE_ENV !== 'production') {
      return {
        name: 'Pro',
        detail: 'All features enabled in this preview environment',
        variant: 'preview',
      };
    }
    return {
      name: 'Pro',
      detail: 'Full access to Pro features',
      variant: 'pro',
    };
  }

  switch (sub) {
    case 'active':
      return { name: 'Pro', detail: 'Unlimited parses and premium features', variant: 'pro' };
    case 'past_due':
      return {
        name: 'Pro',
        detail: 'Payment issue: update billing in Settings to avoid interruption',
        variant: 'pro_issue',
      };
    case 'cancelled':
      return { name: 'Free', detail: '3 parses per day · upgrade when you need more', variant: 'free' };
    default:
      return { name: 'Free', detail: '3 parses per day · upgrade when you need more', variant: 'free' };
  }
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const checkout = firstString(searchParams?.checkout);

  const user = await getCurrentUser();
  if (!user && process.env.NEXTAUTH_DEV_BYPASS !== 'true') {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent('/dashboard')}`);
  }

  const userId = user?.id ?? 'dev-user';

  const [userPortfolios, viewStats, publishedStats, integrationStats, dbUser] = await Promise.all([
    db
      .select({
        id: portfolios.id,
        title: portfolios.title,
        slug: portfolios.slug,
        publicHandle: portfolios.publicHandle,
        theme: portfolios.theme,
        isPublished: portfolios.isPublished,
        createdAt: portfolios.createdAt,
        updatedAt: portfolios.updatedAt,
      })
      .from(portfolios)
      .where(eq(portfolios.userId, userId)),
    db
      .select({
        totalViews: sql<number>`count(${viewLogs.id})`,
      })
      .from(viewLogs)
      .innerJoin(portfolios, eq(viewLogs.portfolioId, portfolios.id))
      .where(eq(portfolios.userId, userId))
      .get(),
    db
      .select({
        publishedCount: sql<number>`count(*)`,
      })
      .from(portfolios)
      .where(and(eq(portfolios.userId, userId), eq(portfolios.isPublished, true)))
      .get(),
    db
      .select({
        n: sql<number>`count(*)`,
      })
      .from(integrations)
      .where(eq(integrations.userId, userId))
      .get(),
    db.select().from(users).where(eq(users.id, userId)).get(),
  ]);

  const totalViews = viewStats?.totalViews ?? 0;
  const publishedCount = publishedStats?.publishedCount ?? 0;
  const integrationCount = integrationStats?.n ?? 0;

  const bypass = isPaymentGatingBypassed();
  const sub = dbUser?.subscriptionStatus ?? 'free';
  const plan = getPlanDisplay(bypass, sub);

  const showUpgradeCta =
    !bypass && sub !== 'active' && sub !== 'past_due';

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-gradient-to-b from-background via-background to-muted/20">
        <DashboardOverview
          checkout={checkout}
          totalViews={totalViews}
          portfolioCount={userPortfolios.length}
          publishedCount={publishedCount}
          integrationCount={integrationCount}
          portfolios={userPortfolios}
          plan={plan}
          showUpgradeCta={showUpgradeCta}
        />
      </main>
    </div>
  );
}
