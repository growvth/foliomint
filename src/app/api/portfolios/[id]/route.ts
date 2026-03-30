import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { portfolios } from '@/lib/db/schema';
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
  }>;

  await db
    .update(portfolios)
    .set({
      ...(body.title ? { title: body.title } : {}),
      ...(body.theme ? { theme: body.theme } : {}),
      ...(typeof body.isPublished === 'boolean' ? { isPublished: body.isPublished } : {}),
      ...(body.content ? { content: body.content as unknown as Record<string, unknown> } : {}),
      updatedAt: new Date(),
    })
    .where(eq(portfolios.id, params.id));

  return NextResponse.json({ ok: true });
}


