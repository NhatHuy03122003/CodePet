import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { authService } from '@/features/auth/services/auth.service';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'read:user user:email',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account || !profile) return false;

      try {
        const githubProfile = {
          id: String(profile.id),
          login: profile.login as string,
          email: profile.email as string | null,
          name: profile.name as string | null,
          avatar_url: profile.avatar_url as string | null,
        };

        // [AUTH DEBUG] temporary logging — raw GitHub profile id
        console.log('[AUTH DEBUG] raw profile.id:', profile.id, '| typeof:', typeof profile.id);

        const dbUser = await authService.upsertUser(githubProfile, account.access_token);
        user.id = dbUser.id;
        return true;
      } catch (error) {
        console.error('Error creating user:', error);
        return false;
      }
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id;
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});
