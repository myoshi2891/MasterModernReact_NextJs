import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      guestId?: number;
    } & DefaultSession["user"];
  }
  interface User extends DefaultUser {
    guestId?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    guestId?: number;
  }
}