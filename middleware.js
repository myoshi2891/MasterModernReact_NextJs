// import { NextResponse } from "next/server";

// export function middleware(request) {
// 	console.log(request);
// 	return NextResponse.redirect(new URL("/about", request.url));
// }

import { withAuth } from "next-auth/middleware";

export default withAuth({
	pages: { signIn: "/login" },
});

export const config = {
	matcher: ["/account/:path*"],
};
