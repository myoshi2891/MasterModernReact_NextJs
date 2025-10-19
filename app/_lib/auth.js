import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createGuest, getGuest } from "./data-service.server";

// 補助: ゲストを取得 or 作成
async function getOrCreateGuestByEmail(email, name) {
  const existing = await getGuest(email); // publicクライアントでOK（SELECT）
  if (existing) return existing;
  // 作成は service-role（createGuest内でadminクライアント使用）
  return await createGuest({ email, fullName: name ?? null });
}

const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  // セッションはJWT運用を明示（v5はデフォルトJWTだが明記推奨）
  session: { strategy: "jwt" },

  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },

    // ① サインイン時：ゲスト作成を試みる（adminで）
    async signIn({ user }) {
      try {
        if (user?.email) {
          await getOrCreateGuestByEmail(user.email, user.name);
        }
        return true;
      } catch (e) {
        console.error("[auth][signIn] create/get guest failed", e);
        // 失敗しても false を返すと AccessDenied になる
        return false;
      }
    },

    // ② JWT：ここで一度だけDBに触れて guestId をトークンへ
    async jwt({ token, user, trigger }) {
      try {
        // 初回（サインイン直後）は user が入る。以後は token 維持
        const email = user?.email ?? token?.email;
        const name = user?.name ?? token?.name;

        if (email && (trigger === "signIn" || token.guestId === undefined)) {
          const guest = await getOrCreateGuestByEmail(email, name);
          token.guestId = guest?.id ?? null; // 失敗してもnullを格納しておく
        }
      } catch (e) {
        console.warn(
          "[auth][jwt] guest lookup failed, keep token without guestId"
        );
        if (token.guestId === undefined) token.guestId = null;
      }
      return token;
    },

    // ③ セッション：DBに触れず token から写すだけ
    async session({ session, token }) {
      // token.guestId が null の可能性もあるので安全に代入
      if (session?.user) {
        session.user.guestId = token?.guestId ?? null;
      }
      return session;
    },
  },

  pages: { signIn: "/login" },
};

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth(authConfig);
