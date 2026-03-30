import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/lib/auth';

import { GenerateForm } from './generate-form';

export default async function GeneratePage() {
  const user = await getCurrentUser();

  if (!user && process.env.NEXTAUTH_DEV_BYPASS !== 'true') {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent('/generate')}`);
  }

  return <GenerateForm />;
}

