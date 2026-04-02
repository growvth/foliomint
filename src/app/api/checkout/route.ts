import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/auth';
import { isPaymentGatingBypassed } from '@/lib/feature-flags';
import { createLemonSqueezyCheckout } from '@/lib/lemonsqueezy';

export async function POST() {
  if (isPaymentGatingBypassed()) {
    return NextResponse.json({ url: '/dashboard?checkout=dev-bypass' });
  }

  const apiKey = process.env.LEMONSQUEEZY_API_KEY?.trim();
  const storeId = process.env.LEMONSQUEEZY_STORE_ID?.trim();
  const variantId = process.env.LEMONSQUEEZY_VARIANT_ID?.trim();

  if (!apiKey || !storeId || !variantId) {
    return NextResponse.json(
      {
        error: 'Lemon Squeezy checkout is not configured (API key, store ID, variant ID)',
        hint: 'For local development without Lemon Squeezy, set BYPASS_PAYMENT_GATING=true in .env.local (see TODO.md).',
      },
      { status: 503 },
    );
  }

  const appUser = await getCurrentUser();
  if (!appUser && process.env.NEXTAUTH_DEV_BYPASS !== 'true') {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const baseUrl = (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '');
  const userId = appUser?.id ?? 'dev-user';
  const email = appUser?.email ?? 'dev@example.com';

  const result = await createLemonSqueezyCheckout({
    apiKey,
    storeId,
    variantId,
    userId,
    email,
    name: appUser?.name,
    baseUrl,
  });

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({ url: result.url });
}
