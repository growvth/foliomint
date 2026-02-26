import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';

import { GenerateForm } from './generate-form';

export default async function GeneratePage() {
  const session = await auth();
  if (!session?.user) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent('/generate')}`);
  }
  return <GenerateForm />;
}
