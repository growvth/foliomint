import type { NextAuthConfig } from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';

export const authConfig = {
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-do-not-use-in-prod',
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  callbacks: {
    authorized({ auth }) {
      if (process.env.NEXTAUTH_DEV_BYPASS === 'true') {
        return true;
      }
      return !!auth?.user;
    },
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl + '/generate';
    },
  },
} satisfies NextAuthConfig;
