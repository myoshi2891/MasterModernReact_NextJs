import type { Metadata } from "next";
import { auth } from "../_lib/auth";

export const metadata: Metadata = {
	title: "Guest area",
};

/**
 * Renders the account page header greeting the current user by first name.
 *
 * @returns A heading element that displays "Welcome {firstName}", where `{firstName}` is the authenticated user's first name or `"Guest"` if unavailable.
 */
export default async function Page() {
	const session = await auth();

	const firstName = session?.user?.name?.split(" ").at(0) ?? "Guest";
	return (
		<h2 className="mb-7 text-2xl font-semibold text-accent-400">
			Welcome {firstName}
		</h2>
	);
}