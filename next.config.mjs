const allowDangerousLocalIp =
  process.env.NODE_ENV === "development" &&
  process.env.CI !== "true" &&
  process.env.NEXT_IMAGES_DANGEROUSLY_ALLOW_LOCAL_IP === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // ローカル開発で NAT64 (64:ff9b::/96) により画像取得が SSRF 拒否される環境では
    // .env.local に NEXT_IMAGES_DANGEROUSLY_ALLOW_LOCAL_IP=true を追加してオプトイン。
    // 本番・CI では環境変数の値にかかわらず SSRF 保護を有効に保つ。
    dangerouslyAllowLocalIP: allowDangerousLocalIp,
    // Next.js 16 で images.qualities 既定が [75] に変更され、未設定の品質値は
    // 最も近い値に強制される。アプリで使用する品質(logo=100, bg=80)を明示し
    // 画質劣化を防ぐ。
    qualities: [75, 80, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ffzgyauorgklffmfhzjg.supabase.co",
        pathname: "/storage/v1/object/public/cabin-images/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/a/**",
      },
    ],
  },
  // output: "export",
};

export default nextConfig;
