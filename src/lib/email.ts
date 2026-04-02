import { Resend } from 'resend';

export async function sendPortfolioPublishedEmail(to: string, title: string, slug: string): Promise<void> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return;

  const resend = new Resend(key);
  const base = (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '');
  const from = process.env.RESEND_FROM?.trim() || 'FolioMint <onboarding@resend.dev>';

  await resend.emails.send({
    from,
    to,
    subject: `Your portfolio "${title}" is live`,
    html: `<p>Your portfolio is published.</p><p><a href="${base}/${slug}">View ${title}</a></p>`,
  });
}
