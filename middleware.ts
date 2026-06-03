import NextAuth from "next-auth";
import { authConfig } from "@/app/_lib/auth.config";

// Next.js 16 は middleware のエクスポートを「関数」として静的に検出する必要があるため、
// 分割代入エクスポート（export const { auth: middleware }）ではなく
// auth ハンドラを default export する。
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
	matcher: ["/account", "/account/:path*"],
};
