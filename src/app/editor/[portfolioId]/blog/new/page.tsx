'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Navbar } from '@/components/domain/navbar';

export default function NewBlogPostPage() {
  const params = useParams<{ portfolioId: string }>();
  const router = useRouter();
  const id = typeof params.portfolioId === 'string' ? params.portfolioId : params.portfolioId?.[0];
  const [title, setTitle] = useState('Untitled post');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [publish, setPublish] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const me = await fetch('/api/me', { credentials: 'include' }).then((r) => r.json() as Promise<{ tier?: string }>);
      if (me.tier !== 'pro') {
        router.replace(`/editor/${id}/blog`);
      }
    })();
  }, [id, router]);

  if (!id) return null;

  const handleCreate = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/portfolios/${id}/blog`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          ...(slug.trim() ? { slug: slug.trim() } : {}),
          content,
          ...(excerpt.trim() ? { excerpt: excerpt.trim() } : {}),
          isPublished: publish,
        }),
      });
      const data = (await res.json()) as { post?: { id: string }; error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Could not create post');
      }
      if (data.post?.id) {
        router.replace(`/editor/${id}/blog/${data.post.id}`);
        return;
      }
      throw new Error('No post id returned');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href={`/editor/${id}/blog`} className="hover:text-foreground">
                Blog
              </Link>
            </li>
            <li aria-hidden className="text-muted-foreground/60">
              /
            </li>
            <li className="font-medium text-foreground">Create post</li>
          </ol>
        </nav>

        <h1 className="mt-6 text-2xl font-bold tracking-tight">Create post</h1>
        <p className="mt-1 text-sm text-muted-foreground">Add a new Markdown article for your public site.</p>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Slug (optional)</label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto from title"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Excerpt</label>
              <Input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Markdown</label>
              <textarea
                className="flex min-h-[240px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} />
              Publish immediately
            </label>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={() => void handleCreate()} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving
                </>
              ) : (
                'Create post'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
