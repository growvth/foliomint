import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { portfolios } from '@/lib/db/schema';
import { sendPortfolioPublishedEmail } from '@/lib/email';
import { userHasProAccess } from '@/lib/pro-access';
import { normalizePublicDomain } from '@/lib/slug';
import type { PortfolioContent } from '@/types';

interface RouteContext {
  params: { id: string };
}

export async function GET(_req: Request, { params }: RouteContext) {
  const appUser = await getCurrentUser();
  if (!appUser && process.env.NEXTAUTH_DEV_BYPASS !== 'true') {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const userId = appUser?.id ?? 'dev-user';

  const portfolio = await db
    .select()
    .from(portfolios)
    .where(eq(portfolios.id, params.id))
    .get();

  if (!portfolio || portfolio.userId !== userId) {
    return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: portfolio.id,
    slug: portfolio.slug,
    title: portfolio.title,
    theme: portfolio.theme,
    isPublished: portfolio.isPublished,
    groqConsent: portfolio.groqConsent,
    content: portfolio.content as unknown as PortfolioContent,
    customDomain: portfolio.customDomain,
    customDomainVerified: portfolio.customDomainVerified ?? false,
    pendingDomainVerification: !!(
      portfolio.domainVerificationToken && portfolio.customDomainVerified !== true
    ),
    createdAt: portfolio.createdAt,
    updatedAt: portfolio.updatedAt,
  });
}

export async function PATCH(req: Request, { params }: RouteContext) {
  const appUser = await getCurrentUser();
  if (!appUser && process.env.NEXTAUTH_DEV_BYPASS !== 'true') {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const userId = appUser?.id ?? 'dev-user';

  const existing = await db
    .select()
    .from(portfolios)
    .where(eq(portfolios.id, params.id))
    .get();

  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
  }

  const body = (await req.json()) as Partial<{
    title: string;
    theme: string;
    isPublished: boolean;
    content: PortfolioContent;
    customDomain: string | null;
  }>;

  if (body.theme !== undefined && body.theme === 'neubrutalism' && !(await userHasProAccess(userId))) {
    return NextResponse.json({ error: 'Neubrutalism theme requires a Pro subscription' }, { status: 403 });
  }

  const set: {
    title?: string;
    theme?: string;
    isPublished?: boolean;
    content?: Record<string, unknown>;
    customDomain?: string | null;
    customDomainVerified?: boolean;
    domainVerificationToken?: string | null;
    updatedAt: Date;
  } = { updatedAt: new Date() };

  if (body.title !== undefined) {
    set.title = body.title;
  }

  if (body.theme !== undefined) {
    set.theme = body.theme;
  }

  if (typeof body.isPublished === 'boolean') {
    set.isPublished = body.isPublished;
  }

  if (body.content !== undefined) {
    set.content = body.content as unknown as Record<string, unknown>;
  }

  if (body.customDomain !== undefined) {
    const next =
      body.customDomain === null || body.customDomain.trim() === ''
        ? null
        : normalizePublicDomain(body.customDomain);
    const prev = existing.customDomain?.trim().length
      ? normalizePublicDomain(existing.customDomain)
      : null;

    if (next !== prev) {
      if (next && !(await userHasProAccess(userId))) {
        return NextResponse.json({ error: 'Custom domains require a Pro subscription' }, { status: 403 });
      }
      set.customDomain = next;
      set.customDomainVerified = false;
      set.domainVerificationToken = null;
    }
  }

  await db.update(portfolios).set(set).where(eq(portfolios.id, params.id));

  const publishEmail = appUser?.email;
  if (
    body.isPublished === true &&
    !existing.isPublished &&
    publishEmail &&
    typeof publishEmail === 'string'
  ) {
    await sendPortfolioPublishedEmail(publishEmail, existing.title, existing.slug);
  }

  return NextResponse.json({ ok: true });
}
