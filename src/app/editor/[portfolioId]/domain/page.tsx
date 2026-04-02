'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Copy, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Navbar } from '@/components/domain/navbar';

export default function EditorDomainPage() {
  const params = useParams<{ portfolioId: string }>();
  const id = typeof params.portfolioId === 'string' ? params.portfolioId : params.portfolioId?.[0];
  const [domain, setDomain] = useState('');
  const [verified, setVerified] = useState(false);
  const [pending, setPending] = useState(false);
  const [tier, setTier] = useState<'free' | 'pro'>('free');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifyInfo, setVerifyInfo] = useState<{
    txtName: string;
    txtValue: string;
    instructions: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // no-op
    }
  };

  const load = useCallback(async () => {
    if (!id) return;
    const [pr, me] = await Promise.all([
      fetch(`/api/portfolios/${id}`, { credentials: 'include' }),
      fetch('/api/me', { credentials: 'include' }),
    ]);
    const meJson = (await me.json()) as { tier?: string };
    setTier(meJson.tier === 'pro' ? 'pro' : 'free');
    if (!pr.ok) return;
    const data = (await pr.json()) as {
      customDomain: string | null;
      customDomainVerified: boolean;
      pendingDomainVerification: boolean;
    };
    setDomain(data.customDomain ?? '');
    setVerified(data.customDomainVerified ?? false);
    setPending(data.pendingDomainVerification);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      try {
        await load();
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, load]);

  const saveDomain = async () => {
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/portfolios/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customDomain: domain.trim() || null }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || 'Could not save');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const requestToken = async () => {
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/portfolios/${id}/domain/request`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = (await res.json()) as {
        txtName?: string;
        txtValue?: string;
        instructions?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setVerifyInfo({
        txtName: data.txtName ?? '',
        txtValue: data.txtValue ?? '',
        instructions: data.instructions ?? '',
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const verifyDns = async () => {
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/portfolios/${id}/domain/verify`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = (await res.json()) as { verified?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      await load();
      setVerifyInfo(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setSaving(false);
    }
  };

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
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
        <Link
          href={`/editor/${id}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to editor
        </Link>

        <h1 className="mt-6 text-2xl font-bold">Custom domain</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Point traffic from your domain after DNS verification. Host routing is configured at deploy time.
        </p>

        {tier === 'free' && (
          <p className="mt-4 rounded-md border border-dashed bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            Pro feature. Use <code className="text-xs">BYPASS_PAYMENT_GATING</code> in dev or{' '}
            <Link href="/pricing" className="text-primary underline">
              upgrade
            </Link>
            .
          </p>
        )}

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Domain</CardTitle>
            <CardDescription>Example: portfolio.example.com (use an apex or subdomain you control)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
              <li className="rounded-md border bg-muted/30 px-3 py-2">
                <span className="font-medium text-foreground">1.</span> Save your domain
              </li>
              <li className="rounded-md border bg-muted/30 px-3 py-2">
                <span className="font-medium text-foreground">2.</span> Generate TXT token
              </li>
              <li className="rounded-md border bg-muted/30 px-3 py-2">
                <span className="font-medium text-foreground">3.</span> Verify in FolioMint
              </li>
            </ol>
            <Input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="your-domain.com"
              disabled={tier === 'free'}
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void saveDomain()} disabled={saving || tier === 'free'}>
                Save domain
              </Button>
              <Button variant="outline" onClick={() => void requestToken()} disabled={saving || tier === 'free' || !domain.trim()}>
                Generate DNS token
              </Button>
              <Button variant="secondary" onClick={() => void verifyDns()} disabled={saving || tier === 'free'}>
                Verify TXT record
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Status:{' '}
              {verified ? (
                <span className="font-medium text-primary">Verified</span>
              ) : pending ? (
                <span className="font-medium text-amber-600">Pending verification</span>
              ) : (
                <span>Not verified</span>
              )}
            </p>
            {verifyInfo && (
              <div className="rounded-md border bg-muted/50 p-3 text-sm">
                <p className="font-medium">DNS</p>
                <p className="mt-2 break-all">
                  <span className="text-muted-foreground">Name: </span>
                  {verifyInfo.txtName}
                  <button
                    type="button"
                    className="ml-2 inline-flex items-center gap-1 rounded border bg-background px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => void copy(verifyInfo.txtName)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </button>
                </p>
                <p className="mt-1 break-all">
                  <span className="text-muted-foreground">Value: </span>
                  {verifyInfo.txtValue}
                  <button
                    type="button"
                    className="ml-2 inline-flex items-center gap-1 rounded border bg-background px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => void copy(verifyInfo.txtValue)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </button>
                </p>
                <p className="mt-2 text-xs text-muted-foreground">{verifyInfo.instructions}</p>
              </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
