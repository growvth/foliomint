import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { isPaymentGatingBypassed } from '@/lib/feature-flags';

export async function userHasProAccess(userId: string): Promise<boolean> {
  if (isPaymentGatingBypassed()) {
    return true;
  }

  const row = await db
    .select({ subscriptionStatus: users.subscriptionStatus })
    .from(users)
    .where(eq(users.id, userId))
    .get();

  return row?.subscriptionStatus === 'active';
}
