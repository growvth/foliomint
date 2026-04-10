'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Plus, Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/domain/navbar';

interface PostRow {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  updatedAt: string;
}

export default function EditorBlogListPage() {
  const params = useParams<{ portfolioId: string }>();
  const router = useRouter();
  const id = typeof params.portfolioId === 'string' ? params.portfolioId : params.portfolioId?.[0];
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [portfolioTitle, setPortfolioTitle] = useState<string | null>(null);
  const [tier, setTier] = useState<'free' | 'pro'>('free');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      try {
        const [pr, pf, me] = await Promise.all([
          fetch(`/api/portfolios/${id}/blog`, { credentials: 'include' }),
          fetch(`/api/portfolios/${id}`, { credentials: 'include' }),
          fetch('/api/me', { credentials: 'include' }),
        ]);
        if (pf.ok) {
          const pfJson = (await pf.json()) as { title?: string };
          if (pfJson.title) setPortfolioTitle(pfJson.title);
        }
        const meJson = (await me.json()) as { tier?: string };
        setTier(meJson.tier === 'pro' ? 'pro' : 'free');
        if (!pr.ok) {
          if (pr.status === 401) {
            router.push(`/sign-in?callbackUrl=${encodeURIComponent(`/editor/${id}/blog`)}`);
            return;
          }
          throw new Error('Failed to load posts');
        }
        const data = (await pr.json()) as { posts: PostRow[] };
        setPosts(data.posts);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  if (!id) return null;

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/dashboard" className="hover:text-foreground">
                Dashboard
              </Link>
            </li>
            <li aria-hidden className="text-muted-foreground/60">
              /
            </li>
            <li>
              <Link href={`/dashboard/portfolios/${id}/manage`} className="hover:text-foreground">
                {portfolioTitle ?? 'Portfolio'}
              </Link>
            </li>
            <li aria-hidden className="text-muted-foreground/60">
              /
            </li>
            <li className="font-medium text-foreground">Blog</li>
          </ol>
        </nav>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Blog</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Markdown posts for your public site—create and edit in dedicated flows below.
            </p>
          </div>
          {tier === 'pro' ? (
            <Button asChild size="default" className="w-full shrink-0 sm:w-auto">
              <Link href={`/editor/${id}/blog/new`}>
                <Plus className="mr-2 h-4 w-4" />
                New post
              </Link>
            </Button>
          ) : (
            <Button size="default" variant="outline" asChild className="w-full shrink-0 sm:w-auto">
              <Link href="/pricing">Upgrade for blog</Link>
            </Button>
          )}
        </div>

        {tier === 'free' && (
          <Card className="mt-4 border-dashed bg-muted/20">
            <CardContent className="space-y-3 py-4">
              <p className="text-sm text-muted-foreground">
                Add a `/blog` to your portfolio to share updates, writing, and project notes.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button asChild size="sm">
                  <Link href={`/pricing?from=${encodeURIComponent(`/editor/${id}/blog`)}&intent=blog`}>Upgrade for blog</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/dashboard/portfolios/${id}/manage`}>Back to portfolio management</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        <div className="mt-8 space-y-3">
          {posts.length === 0 ? (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-lg">No posts yet</CardTitle>
                <CardDescription>
                  {tier === 'pro'
                    ? 'Short articles and release notes help visitors learn what you ship—start with one post.'
                    : 'Blog publishing is included on Pro. Upgrade when you want a /blog on your live site.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tier === 'pro' ? (
                  <Button asChild>
                    <Link href={`/editor/${id}/blog/new`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create your first post
                    </Link>
                  </Button>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button asChild variant="default">
                      <Link href={`/pricing?from=${encodeURIComponent(`/editor/${id}/blog`)}&intent=blog`}>
                        View plans for blog
                      </Link>
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Your portfolio editing stays available now, and you can add blog publishing when needed.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            posts.map((p) => (
              <Card key={p.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.isPublished ? 'Published' : 'Draft'} · /{p.slug}
                    </p>
                  </div>
                  {tier === 'pro' ? (
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/editor/${id}/blog/${p.id}`}>
                        <Pencil className="mr-1 h-3 w-3" />
                        Edit post
                      </Link>
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
