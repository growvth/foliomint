import { redirect } from 'next/navigation';

import { HomeMarketing } from '@/components/domain/home-marketing';
import { getCurrentUser } from '@/lib/auth';

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) {
    redirect('/dashboard');
  }

  return <HomeMarketing />;
}
