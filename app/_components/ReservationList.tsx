"use client";

import { useOptimistic } from "react";
import { deleteBooking } from "../_lib/actions";
import ReservationCard from "./ReservationCard";
import type { BookingListItem } from "../_lib/data-service";

interface ReservationListProps {
	bookings: BookingListItem[];
}

/**
 * Render a list of reservation cards and handle optimistic deletion of bookings.
 *
 * Removes a booking from the displayed list immediately when deleted, then performs the server-side deletion via `deleteBooking`.
 *
 * @param bookings - The initial array of bookings to render
 * @returns The unordered list element containing a ReservationCard for each booking
 */
function ReservationList({ bookings }: ReservationListProps) {
	const [optimisticBookings, optimisticDelete] = useOptimistic(
		bookings,
		(curBookings: BookingListItem[], bookingId: number) => {
			return curBookings.filter((booking) => booking.id !== bookingId);
		}
	);

	async function handleDelete(bookingId: number) {
		optimisticDelete(bookingId);
		await deleteBooking(bookingId);
	}

	return (
		<ul className="space-y-6">
			{optimisticBookings.map((booking) => (
				<ReservationCard
					onDelete={handleDelete}
					booking={booking}
					key={booking.id}
				/>
			))}
		</ul>
	);
}

export default ReservationList;