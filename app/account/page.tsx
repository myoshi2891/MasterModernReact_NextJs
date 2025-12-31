import type { Metadata } from "next";
import { auth } from "../_lib/auth";

export const metadata: Metadata = {
	title: "Guest area",
};

export default async function Page() {
	const session = await auth();

	const firstName = session?.user?.name?.split(" ").at(0) ?? "Guest";
	return (
		<h2 className="mb-7 text-2xl font-semibold text-accent-400">
			Welcome {firstName}
		</h2>
	);
}