import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const authConfig = {
	providers: [
		GoogleProvider({
			clientId: process.env.AUTH_GOOGLE_ID,
			clientSecret: process.env.AUTH_GOOGLE_SECRET,
		}),
		// CredentialProvider
	],
	callbacks: {
		authorized({ auth, request }) {
			return !!auth?.user;
		},
	},
};

export const {
	auth,
	handlers: { GET, POST },
} = NextAuth(authConfig);
