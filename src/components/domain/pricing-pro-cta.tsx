'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PricingProCtaProps {
  className?: string;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function PricingProCta({ className, variant = 'default', size = 'lg' }: PricingProCtaProps) {
  const router = useRouter();
  const { status } = useSession();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (status !== 'authenticated') {
      router.push('/sign-in?callbackUrl=/pricing');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        credentials: 'include',
      });
      const data = (await res.json()) as { url?: string; error?: string; hint?: string };
      if (!res.ok) {
        const msg = [data.error, data.hint].filter(Boolean).join('\n\n');
        throw new Error(msg || 'Could not start checkout');
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error('No checkout URL returned');
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      className={cn('w-full', className)}
      variant={variant}
      size={size}
      onClick={() => void handleClick()}
      disabled={loading || status === 'loading'}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Redirecting…
        </>
      ) : (
        'Start Pro'
      )}
    </Button>
  );
}
