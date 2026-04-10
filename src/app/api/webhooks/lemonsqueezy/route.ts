import { NextResponse } from 'next/server';
import { eq, or } from 'drizzle-orm';

import { db } from '@/lib/db';
import { portfolios, users } from '@/lib/db/schema';
import { mapLemonSubscriptionStatus, verifyLemonSqueezyWebhookSignature } from '@/lib/lemonsqueezy';

type WebhookPayload = {
  meta?: {
    event_name?: string;
    custom_data?: { user_id?: string };
  };
  data?: {
    type?: string;
    id?: string;
    attributes?: {
      customer_id?: number;
      user_email?: string;
      status?: string;
    };
  };
};

export async function POST(request: Request) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get('X-Signature');

  if (!verifyLemonSqueezyWebhookSignature(rawBody, secret, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(rawBody) as WebhookPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const eventName = payload.meta?.event_name;
  if (!eventName) {
    return NextResponse.json({ received: true });
  }

  const data = payload.data;
  const attrs = data?.attributes;
  const subscriptionId = data?.id != null ? String(data.id) : undefined;

  if (!attrs || !subscriptionId) {
    return NextResponse.json({ received: true });
  }

  const customerId = attrs.customer_id != null ? String(attrs.customer_id) : undefined;
  const lsStatus = attrs.status;
  const userEmail = attrs.user_email?.trim();

  const applySubscriptionPatch = async (userId: string) => {
    const appStatus = lsStatus ? mapLemonSubscriptionStatus(lsStatus) : 'active';

    await db
      .update(users)
      .set({
        subscriptionStatus: appStatus,
        ...(customerId ? { lemonSqueezyCustomerId: customerId } : {}),
        lemonSqueezySubscriptionId: subscriptionId,
      })
      .where(eq(users.id, userId));

    if (appStatus === 'active') {
      await db
        .update(portfolios)
        .set({ expiresAt: null, updatedAt: new Date() })
        .where(eq(portfolios.userId, userId));
    }
  };

  const findUserId = (): string | undefined => {
    const raw = payload.meta?.custom_data?.user_id;
    if (raw != null && String(raw).length > 0) {
      return String(raw);
    }
    return undefined;
  };

  switch (eventName) {
    case 'subscription_created': {
      const userId = findUserId();
      if (userId) {
        await applySubscriptionPatch(userId);
        break;
      }
      if (userEmail) {
        const appStatus = lsStatus ? mapLemonSubscriptionStatus(lsStatus) : 'active';
        const byEmail = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.email, userEmail))
          .get();

        await db
          .update(users)
          .set({
            subscriptionStatus: appStatus,
            ...(customerId ? { lemonSqueezyCustomerId: customerId } : {}),
            lemonSqueezySubscriptionId: subscriptionId,
          })
          .where(eq(users.email, userEmail));

        if (appStatus === 'active' && byEmail?.id) {
          await db
            .update(portfolios)
            .set({ expiresAt: null, updatedAt: new Date() })
            .where(eq(portfolios.userId, byEmail.id));
        }
      }
      break;
    }

    case 'subscription_updated':
    case 'subscription_resumed':
    case 'subscription_paused':
    case 'subscription_cancelled': {
      if (!lsStatus) break;
      const appStatus = mapLemonSubscriptionStatus(lsStatus);

      const bySub = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.lemonSqueezySubscriptionId, subscriptionId))
        .get();

      if (bySub) {
        await db
          .update(users)
          .set({
            subscriptionStatus: appStatus,
            ...(customerId ? { lemonSqueezyCustomerId: customerId } : {}),
          })
          .where(eq(users.id, bySub.id));
        if (appStatus === 'active') {
          await db
            .update(portfolios)
            .set({ expiresAt: null, updatedAt: new Date() })
            .where(eq(portfolios.userId, bySub.id));
        }
        break;
      }

      const uid = findUserId();
      if (uid) {
        await applySubscriptionPatch(uid);
        break;
      }

      if (userEmail) {
        const byEmail = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.email, userEmail))
          .get();

        await db
          .update(users)
          .set({
            subscriptionStatus: appStatus,
            ...(customerId ? { lemonSqueezyCustomerId: customerId } : {}),
            lemonSqueezySubscriptionId: subscriptionId,
          })
          .where(eq(users.email, userEmail));

        if (appStatus === 'active' && byEmail?.id) {
          await db
            .update(portfolios)
            .set({ expiresAt: null, updatedAt: new Date() })
            .where(eq(portfolios.userId, byEmail.id));
        }
      }
      break;
    }

    case 'subscription_expired': {
      if (userEmail) {
        await db
          .update(users)
          .set({ subscriptionStatus: 'cancelled' })
          .where(
            or(eq(users.lemonSqueezySubscriptionId, subscriptionId), eq(users.email, userEmail)),
          );
      } else {
        await db
          .update(users)
          .set({ subscriptionStatus: 'cancelled' })
          .where(eq(users.lemonSqueezySubscriptionId, subscriptionId));
      }
      break;
    }

    case 'subscription_payment_failed': {
      await db
        .update(users)
        .set({ subscriptionStatus: 'past_due' })
        .where(eq(users.lemonSqueezySubscriptionId, subscriptionId));
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
