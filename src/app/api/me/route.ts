import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { isPaymentGatingBypassed } from '@/lib/feature-flags';

export const dynamic = 'force-dynamic';

export async function GET() {
  const appUser = await getCurrentUser();
  if (!appUser && process.env.NEXTAUTH_DEV_BYPASS !== 'true') {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const userId = appUser?.id ?? 'dev-user';

  if (isPaymentGatingBypassed()) {
    return NextResponse.json({ tier: 'pro' as const, email: appUser?.email ?? 'dev@example.com' });
  }

  const row = await db
    .select({ subscriptionStatus: users.subscriptionStatus })
    .from(users)
    .where(eq(users.id, userId))
    .get();

  const tier = row?.subscriptionStatus === 'active' ? ('pro' as const) : ('free' as const);

  return NextResponse.json({
    tier,
    email: appUser?.email ?? null,
  });
}
