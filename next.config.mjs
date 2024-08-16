/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "https://ffzgyauorgklffmfhzjg.supabase.co",
				port: "",
				pathname: "/storage/v1/object/public/cabin-images/**",
			},
		],
	},
};

export default nextConfig;
