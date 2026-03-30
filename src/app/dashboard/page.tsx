import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus, ExternalLink, BarChart3, Settings, Globe, Pencil } from 'lucide-react';

import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { portfolios, viewLogs } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/domain/navbar';
import { eq, sql } from 'drizzle-orm';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user && process.env.NEXTAUTH_DEV_BYPASS !== 'true') {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent('/dashboard')}`);
  }

  const userId = user?.id ?? 'dev-user';

  const [userPortfolios, stats] = await Promise.all([
    db
      .select({
        id: portfolios.id,
        title: portfolios.title,
        slug: portfolios.slug,
        theme: portfolios.theme,
        isPublished: portfolios.isPublished,
        createdAt: portfolios.createdAt,
        updatedAt: portfolios.updatedAt,
      })
      .from(portfolios)
      .where(eq(portfolios.userId, userId)),
    db
      .select({
        totalViews: sql<number>`count(*)`,
        publishedCount: sql<number>`sum(case when ${portfolios.isPublished} = 1 then 1 else 0 end)`,
      })
      .from(portfolios)
      .leftJoin(viewLogs, eq(viewLogs.portfolioId, portfolios.id))
      .where(eq(portfolios.userId, userId))
      .get(),
  ]);

  const totalViews = stats?.totalViews ?? 0;
  const publishedCount = stats?.publishedCount ?? 0;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
              { label: 'Integrations', value: '0', description: 'Coming soon' },
              { label: 'Plan', value: 'Free', description: '3 parses/day' },
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
                          <Link href={`/${portfolio.slug}`} target="_blank">
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
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
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
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
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
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
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
          </div>
        </div>
      </main>
    </div>
  );
}

