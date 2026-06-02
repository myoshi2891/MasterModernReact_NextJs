/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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
