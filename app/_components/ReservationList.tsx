"use client";

import { useOptimistic } from "react";
import { deleteBooking } from "../_lib/actions";
import ReservationCard from "./ReservationCard";
import type { BookingListItem } from "../_lib/data-service";

interface ReservationListProps {
	bookings: BookingListItem[];
}

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