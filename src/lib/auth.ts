import NextAuth from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';

import { authConfig } from '@/lib/auth.config';
import { db } from '@/lib/db';
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from '@/lib/db/schema';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
});

export interface AppUser {
  id: string;
  email: string;
  name?: string | null;
}

export async function getCurrentUser(): Promise<AppUser | null> {
  if (process.env.NEXTAUTH_DEV_BYPASS === 'true') {
    return {
      id: 'dev-user',
      email: 'dev@example.com',
      name: 'Dev User',
    };
  }

  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  };
}
