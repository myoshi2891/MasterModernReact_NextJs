/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Next 16 の SSRF 対策はリモート画像ホストの解決 IP を検査し、プライベート/予約済み
    // IP（ローカル DNS64 が返す NAT64 `64:ff9b::/96` 等）を含むと取得を拒否する。
    // 本番では SSRF 保護を維持しつつ、ローカル開発の NAT64 解決のみ回避する。
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
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
