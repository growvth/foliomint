'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Navbar } from '@/components/domain/navbar';

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  isPublished: boolean;
}

export default function EditBlogPostPage() {
  const params = useParams<{ portfolioId: string; postId: string }>();
  const router = useRouter();
  const portfolioId =
    typeof params.portfolioId === 'string' ? params.portfolioId : params.portfolioId?.[0];
  const postId = typeof params.postId === 'string' ? params.postId : params.postId?.[0];

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!portfolioId || !postId) return;
    void (async () => {
      try {
        const me = await fetch('/api/me', { credentials: 'include' }).then((r) => r.json() as Promise<{ tier?: string }>);
        if (me.tier !== 'pro') {
          router.replace(`/editor/${portfolioId}/blog`);
          return;
        }
        const res = await fetch(`/api/portfolios/${portfolioId}/blog/${postId}`, {
          credentials: 'include',
        });
        if (!res.ok) {
          if (res.status === 401) {
            router.push(`/sign-in?callbackUrl=${encodeURIComponent(`/editor/${portfolioId}/blog/${postId}`)}`);
            return;
          }
          throw new Error('Failed to load post');
        }
        const data = (await res.json()) as { post: Post };
        setPost(data.post);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, [portfolioId, postId, router]);

  const save = async (patch: Partial<Post>) => {
    if (!portfolioId || !postId || !post) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/portfolios/${portfolioId}/blog/${postId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const data = (await res.json()) as { post?: Post; error?: string };
      if (!res.ok) throw new Error(data.error || 'Save failed');
      if (data.post) setPost(data.post);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!portfolioId || !postId) return;
    if (!confirm('Delete this post?')) return;
    const res = await fetch(`/api/portfolios/${portfolioId}/blog/${postId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) {
      router.push(`/editor/${portfolioId}/blog`);
    }
  };

  if (!portfolioId || !postId) return null;

  if (loading || !post) {
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
        <Link
          href={`/editor/${portfolioId}/blog`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          All posts
        </Link>

        <h1 className="mt-6 text-2xl font-bold">Edit post</h1>

        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Content</CardTitle>
            <Button variant="destructive" size="sm" onClick={() => void remove()}>
              <Trash2 className="mr-1 h-4 w-4" />
              Delete
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Title</label>
              <Input
                value={post.title}
                onChange={(e) => setPost({ ...post, title: e.target.value })}
                onBlur={() => void save({ title: post.title })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Slug</label>
              <Input
                value={post.slug}
                onChange={(e) => setPost({ ...post, slug: e.target.value })}
                onBlur={() => void save({ slug: post.slug })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Excerpt</label>
              <Input
                value={post.excerpt ?? ''}
                onChange={(e) => setPost({ ...post, excerpt: e.target.value || null })}
                onBlur={() => void save({ excerpt: post.excerpt })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Markdown</label>
              <textarea
                className="flex min-h-[280px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={post.content}
                onChange={(e) => setPost({ ...post, content: e.target.value })}
                onBlur={() => void save({ content: post.content })}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={post.isPublished}
                onChange={(e) => {
                  const isPublished = e.target.checked;
                  setPost({ ...post, isPublished });
                  void save({ isPublished });
                }}
              />
              Published
            </label>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {saving && <p className="text-xs text-muted-foreground">Saving…</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
