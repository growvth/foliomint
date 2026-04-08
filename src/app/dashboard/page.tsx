import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus, ExternalLink, BarChart3, Settings, Globe, Pencil } from 'lucide-react';

import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { integrations, portfolios, users, viewLogs } from '@/lib/db/schema';
import { isPaymentGatingBypassed } from '@/lib/feature-flags';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/domain/navbar';
import { and, eq, sql } from 'drizzle-orm';

import { portfolioSiteBasePath } from '@/lib/public-handle';

type DashboardPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function firstString(v: string | string[] | undefined): string | undefined {
  if (typeof v === 'string') return v;
  if (Array.isArray(v) && v[0]) return v[0];
  return undefined;
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
  const planLabel =
    bypass
      ? { title: 'Dev', subtitle: 'Payment gating bypassed' }
      : sub === 'active'
        ? { title: 'Pro', subtitle: 'Unlimited parses' }
        : sub === 'past_due'
          ? { title: 'Pro', subtitle: 'Payment past due — update billing' }
          : sub === 'cancelled'
            ? { title: 'Free', subtitle: 'Subscription ended' }
            : { title: 'Free', subtitle: '3 parses/day' };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {checkout === 'dev-bypass' && (
            <p className="mb-6 rounded-md border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
              Dev mode: payment gating is bypassed. Configure Lemon Squeezy and turn off{' '}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">BYPASS_PAYMENT_GATING</code> when you
              are ready — see <code className="rounded bg-muted px-1 py-0.5 text-xs">TODO.md</code>.
            </p>
          )}
          {checkout === 'success' && (
            <p className="mb-6 rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
              Thanks for subscribing. If your plan does not update immediately, wait a few seconds for the
              webhook, then refresh.
            </p>
          )}
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="mt-1 text-muted-foreground">
                Manage your portfolios, integrations, and analytics.
              </p>
            </div>
            <Button asChild>
              <Link href="/generate">
                <Plus className="mr-2 h-4 w-4" />
                New Portfolio
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Total Views', value: totalViews.toString(), description: 'All time' },
              {
                label: 'Portfolios',
                value: userPortfolios.length.toString(),
                description: `${publishedCount} published`,
              },
              {
                label: 'Integrations',
                value: integrationCount.toString(),
                description: integrationCount > 0 ? 'Connected' : 'Coming soon',
              },
              { label: 'Plan', value: planLabel.title, description: planLabel.subtitle },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardHeader className="pb-2">
                  <CardDescription>{stat.label}</CardDescription>
                  <CardTitle className="text-2xl">{stat.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Portfolios */}
          <div className="mt-12">
            <h2 className="text-xl font-semibold">Your Portfolios</h2>
            <div className="mt-6 space-y-4">
              {userPortfolios.length === 0 ? (
                <Card className="flex flex-col items-center justify-center py-16">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Plus className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="mt-4 text-sm font-medium">No portfolios yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Upload your resume to create your first portfolio.
                  </p>
                  <Button asChild className="mt-6" size="sm">
                    <Link href="/generate">Create Portfolio</Link>
                  </Button>
                </Card>
              ) : (
                userPortfolios.map((portfolio) => (
                  <Card key={portfolio.id} className="flex items-center justify-between">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        {portfolio.title}
                        <Badge variant={portfolio.isPublished ? 'default' : 'outline'}>
                          {portfolio.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Updated{' '}
                        {portfolio.updatedAt
                          ? new Date(portfolio.updatedAt).toLocaleDateString()
                          : 'recently'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/editor/${portfolio.id}`}>
                          <Pencil className="mr-1 h-3 w-3" />
                          Edit
                        </Link>
                      </Button>
                      {portfolio.isPublished && (
                        <Button asChild variant="ghost" size="sm">
                          <Link
                            href={portfolioSiteBasePath({
                              publicHandle: portfolio.publicHandle ?? null,
                              slug: portfolio.slug,
                            })}
                            target="_blank"
                          >
                            <Globe className="mr-1 h-3 w-3" />
                            View
                          </Link>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Quick links */}
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            <Link href="/dashboard/analytics" className="block">
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Analytics</CardTitle>
                      <CardDescription className="text-xs">View portfolio performance</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/dashboard/integrations" className="block">
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <ExternalLink className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Integrations</CardTitle>
                      <CardDescription className="text-xs">Connect your platforms</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/dashboard/settings" className="block">
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <Settings className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Settings</CardTitle>
                      <CardDescription className="text-xs">Manage account & billing</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

