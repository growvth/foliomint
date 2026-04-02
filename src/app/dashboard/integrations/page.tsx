'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';

import { INTEGRATION_PLATFORMS } from '@/lib/social-links';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Navbar } from '@/components/domain/navbar';

interface Row {
  id: string;
  platform: string;
  username: string | null;
  data: Record<string, unknown> | null;
}

export default function IntegrationsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [tier, setTier] = useState<'free' | 'pro'>('free');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [platform, setPlatform] = useState<string>('github');
  const [username, setUsername] = useState('');
  const [url, setUrl] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        const [ir, me] = await Promise.all([
          fetch('/api/integrations', { credentials: 'include' }),
          fetch('/api/me', { credentials: 'include' }),
        ]);
        if (ir.status === 401) {
          router.replace(`/sign-in?callbackUrl=${encodeURIComponent('/dashboard/integrations')}`);
          return;
        }
        const meJson = (await me.json()) as { tier?: string };
        setTier(meJson.tier === 'pro' ? 'pro' : 'free');
        const data = (await ir.json()) as { integrations: Row[] };
        setRows(data.integrations);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const add = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          username: username.trim() || undefined,
          url: url.trim() || undefined,
        }),
      });
      const data = (await res.json()) as { error?: string; integration?: Row };
      if (!res.ok) throw new Error(data.error || 'Could not save');
      if (data.integration) {
        setRows((prev) => {
          const i = prev.findIndex((r) => r.id === data.integration!.id);
          if (i >= 0) {
            const next = [...prev];
            next[i] = data.integration!;
            return next;
          }
          return [...prev, data.integration!];
        });
      }
      setUsername('');
      setUrl('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (integrationId: string) => {
    const res = await fetch(`/api/integrations/${integrationId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) {
      setRows((prev) => prev.filter((r) => r.id !== integrationId));
    }
  };

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
      <main className="flex-1 py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>

          <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
          <p className="mt-1 text-muted-foreground">
            Link GitHub, LinkedIn, and more. Shown on your public portfolio.
          </p>

          {tier === 'free' && (
            <p className="mt-4 rounded-md border border-dashed bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              Pro feature — add links to your live site. In dev, set{' '}
              <code className="text-xs">BYPASS_PAYMENT_GATING=true</code> or{' '}
              <Link href="/pricing" className="text-primary underline">
                upgrade
              </Link>
              .
            </p>
          )}

          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">Add link</CardTitle>
              <CardDescription>Username is used to build default profile URLs where applicable.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Platform</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    disabled={tier === 'free'}
                  >
                    {INTEGRATION_PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Username</label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="handle"
                    disabled={tier === 'free'}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">URL (optional)</label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://…"
                  disabled={tier === 'free'}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button onClick={() => void add()} disabled={saving || tier === 'free'}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save integration'}
              </Button>
            </CardContent>
          </Card>

          <div className="mt-8 space-y-3">
            <h2 className="text-lg font-semibold">Your links</h2>
            {rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No integrations yet.</p>
            ) : (
              rows.map((r) => (
                <Card key={r.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium capitalize">{r.platform}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.username ?? (r.data?.url as string) ?? '—'}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => void remove(r.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
