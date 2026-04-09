import { getCurrentUser } from '@/lib/auth';

import { GenerateForm } from './generate-form';

export default async function GeneratePage() {
  const user = await getCurrentUser();
  const isAuthed = Boolean(user) || process.env.NEXTAUTH_DEV_BYPASS === 'true';

  return <GenerateForm isAuthed={isAuthed} />;
}

