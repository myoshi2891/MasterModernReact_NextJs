import NextAuth from "next-auth";
import { getServerSession, NextAuthOptions, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import { createGuest, getGuest, DatabaseError } from "./data-service";
import type { Guest } from "@/types/domain";

/**
 * Fetches a guest by email and creates one if none exists.
 * @param email - The guest's email address to look up or create.
 * @param name - Optional full name for a new guest; if omitted, the guest's `fullName` will be set to empty string.
 * @returns The guest record for the given email, either existing or newly created.
 */
async function getOrCreateGuestByEmail(
  email: string,
  name: string | null | undefined
): Promise<Guest> {
  const existing = await getGuest(email); // publicクライアントでOK（SELECT）
  if (existing) return existing;
  // 作成は service-role（createGuest内でadminクライアント使用）
  try {
    return await createGuest({ email, fullName: name ?? "" });
  } catch (error) {
    const dbError = error as DatabaseError;
    if (dbError?.code === "23505") {
      const createdByAnotherRequest = await getGuest(email);
      if (createdByAnotherRequest) return createdByAnotherRequest;
    }
    throw error;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  // セッションはJWT運用を明示
  session: { strategy: "jwt" },

  callbacks: {
    // ① サインイン時：ここでは認証のみ
    async signIn() {
      return true;
    },

    // ② JWT：ここで一度だけDBに触れて guestId をトークンへ
    async jwt({ token, user, trigger }): Promise<JWT> {
      try {
        // 初回（サインイン直後）は user が入る。以後は token 維持
        const email = user?.email ?? token?.email;
        const name = user?.name ?? token?.name;

        if (email && (trigger === "signIn" || token.guestId === undefined)) {
          const guest = await getOrCreateGuestByEmail(email, name);
          token.guestId = guest?.id ?? null; // 失敗してもnullを格納しておく
        }
      } catch {
        console.warn(
          "[auth][jwt] guest lookup failed, keep token without guestId"
        );
        // guestIdが未設定の場合はundefinedのまま維持（明示的に何もしない）
      }
      return token;
    },

    // ③ セッション：DBに触れず token から写すだけ
    async session({ session, token }): Promise<Session> {
      // token.guestId は number | null | undefined のいずれかを取りうる
      // session.user.guestId は number | undefined のみ許容するため、null を undefined に変換
      if (session?.user) {
        session.user.guestId =
          typeof token?.guestId === "number" ? token.guestId : undefined;
      }
      return session;
    },
  },

  pages: { signIn: "/login" },
};

export const auth = (): Promise<Session | null> => getServerSession(authOptions);

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
