import type { Metadata } from "next";
import ReservationList from "@/app/_components/ReservationList";
import { auth } from "@/app/_lib/auth";
import { getBookings } from "@/app/_lib/data-service";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Reservations",
};

export const dynamic = "force-dynamic";

export default async function Page() {
	const session = await auth();
	if (!session?.user?.guestId) {
		throw new Error("You must be logged in to view reservations");
	}
	const bookings = await getBookings(session.user.guestId);

	return (
		<div>
			<h2 className="mb-7 text-2xl font-semibold text-accent-400">
				Your reservations
			</h2>

			{bookings.length === 0 ? (
				<p className="text-lg">
					You have no reservations yet. Check out our{" "}
					<Link className="text-accent-500 underline" href="/cabins">
						luxury cabins &rarr;
					</Link>
				</p>
			) : (
				<ReservationList bookings={bookings} />
			)}
		</div>
	);
}