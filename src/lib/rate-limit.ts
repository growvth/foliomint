import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { uploadAttempts } from '@/lib/db/schema';

const FREE_TIER_DAILY_LIMIT = 3;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export async function checkUploadLimit(
  userId: string,
): Promise<{ allowed: boolean; remaining: number }> {
  const record = await db
    .select()
    .from(uploadAttempts)
    .where(eq(uploadAttempts.userId, userId))
    .get();

  if (!record) {
    return { allowed: true, remaining: FREE_TIER_DAILY_LIMIT };
  }

  const elapsed = Date.now() - record.lastAttempt.getTime();

  if (elapsed >= TWENTY_FOUR_HOURS_MS) {
    return { allowed: true, remaining: FREE_TIER_DAILY_LIMIT };
  }

  const remaining = FREE_TIER_DAILY_LIMIT - record.count24h;
  return { allowed: remaining > 0, remaining: Math.max(0, remaining) };
}

export async function recordUploadAttempt(userId: string): Promise<void> {
  const existing = await db
    .select()
    .from(uploadAttempts)
    .where(eq(uploadAttempts.userId, userId))
    .get();

  const now = new Date();

  if (!existing) {
    await db.insert(uploadAttempts).values({
      userId,
      lastAttempt: now,
      count24h: 1,
    });
    return;
  }

  const elapsed = Date.now() - existing.lastAttempt.getTime();
  const shouldReset = elapsed >= TWENTY_FOUR_HOURS_MS;

  await db
    .update(uploadAttempts)
    .set({
      lastAttempt: now,
      count24h: shouldReset ? 1 : existing.count24h + 1,
    })
    .where(eq(uploadAttempts.userId, userId));
}
