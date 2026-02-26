import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface PortfolioPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PortfolioPageProps): Promise<Metadata> {
  // TODO: Fetch portfolio by slug from DB
  return {
    title: `${params.slug}'s Portfolio`,
    description: `Professional portfolio of ${params.slug}`,
  };
}

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const { slug } = params;

  // TODO: Replace with actual DB query
  // const portfolio = await db.select().from(portfolios).where(eq(portfolios.slug, slug)).get();
  // if (!portfolio || !portfolio.isPublished) return notFound();

  return (
    <div className="min-h-screen bg-background">
      {/* Theme toggle for viewers */}
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
            {slug.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{slug}</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            This portfolio is under construction. Content will appear once published.
          </p>
        </header>

        {/* Placeholder sections */}
        <div className="mt-16 space-y-12">
          <section>
            <h2 className="text-xl font-semibold">About</h2>
            <div className="mt-4 rounded-lg border bg-card p-6">
              <p className="text-muted-foreground">Bio will appear here.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Skills</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary">Skills will appear here</Badge>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Experience</h2>
            <div className="mt-4 rounded-lg border bg-card p-6">
              <p className="text-muted-foreground">Experience entries will appear here.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Projects</h2>
            <div className="mt-4 rounded-lg border bg-card p-6">
              <p className="text-muted-foreground">Projects will appear here.</p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-24 border-t pt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Built with{' '}
            <a href="/" className="text-primary hover:underline">
              FolioMint
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
