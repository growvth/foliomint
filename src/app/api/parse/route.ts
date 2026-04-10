import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';

import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { portfolios, users } from '@/lib/db/schema';
import { isPaymentGatingBypassed } from '@/lib/feature-flags';
import { extractResumeFields } from '@/lib/groq';
import { extractTextFromFile, buildFallbackResumeData } from '@/lib/resume-parser';
import { checkUploadLimit, recordUploadAttempt } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const appUser = await getCurrentUser();

    if (!appUser && process.env.NEXTAUTH_DEV_BYPASS !== 'true') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = appUser?.id ?? 'dev-user';
    const userEmail = appUser?.email ?? 'dev@example.com';

    let user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .get();

    if (!user) {
      if (process.env.NEXTAUTH_DEV_BYPASS === 'true') {
        await db.insert(users).values({
          id: userId,
          email: userEmail,
          name: appUser?.name ?? 'Dev User',
        });

        user = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .get();
        if (!user) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
      } else {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    }

    const isPaid =
      isPaymentGatingBypassed() || user.subscriptionStatus === 'active';

    if (!isPaid) {
      const existingPortfolios = await db
        .select({ id: portfolios.id, expiresAt: portfolios.expiresAt })
        .from(portfolios)
        .where(eq(portfolios.userId, userId));

      const hasActivePortfolio = existingPortfolios.some(
        (p) => !p.expiresAt || p.expiresAt > new Date(),
      );
      if (hasActivePortfolio) {
        return NextResponse.json(
          {
            error:
              'Free includes one active portfolio. Upgrade to Pro for multiple portfolios, or wait for expiry before creating another.',
          },
          { status: 403 },
        );
      }

      const { allowed, remaining } = await checkUploadLimit(userId);
      if (!allowed) {
        return NextResponse.json(
          {
            error: `Daily upload limit reached (${remaining} remaining). Upgrade to Pro for unlimited parses.`,
          },
          { status: 429 },
        );
      }
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const consent = formData.get('consent') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const rawText = await extractTextFromFile(buffer, file.type);

    let resumeData;
    if (consent) {
      try {
        resumeData = await extractResumeFields(rawText);
      } catch {
        resumeData = buildFallbackResumeData(rawText);
      }
    } else {
      resumeData = buildFallbackResumeData(rawText);
    }

    const portfolioId = nanoid(12);
    const slug = `${resumeData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${nanoid(6)}`;

    await db.insert(portfolios).values({
      id: portfolioId,
      userId,
      slug,
      title: `${resumeData.name}'s Portfolio`,
      content: resumeData as unknown as Record<string, unknown>,
      groqConsent: consent,
      expiresAt:
        isPaid ? null : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    });

    if (!isPaid) {
      await recordUploadAttempt(userId);
    }

    return NextResponse.json({ portfolioId, slug });
  } catch (error) {
    console.error('Parse API error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Failed to process resume. Please try again.' },
      { status: 500 },
    );
  }
}

