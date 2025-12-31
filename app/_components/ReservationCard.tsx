import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { format, formatDistance, isPast, isToday, parseISO } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import DeleteReservation from "./DeleteReservation";
import type { BookingListItem } from "../_lib/data-service";

export const formatDistanceFromNow = (dateInput: Date | string) =>
	formatDistance(
		dateInput instanceof Date ? dateInput : parseISO(dateInput),
		new Date(),
		{
			addSuffix: true,
		}
	).replace("about ", "");

interface ReservationCardProps {
	booking: BookingListItem;
	onDelete: (bookingId: number) => void;
}

/**
 * Renders a reservation card for a cabin booking, showing date range and relative date, past/upcoming status, price, guest count, booking date, and edit/delete actions for upcoming bookings.
 *
 * @param booking - The booking to render (includes cabin details, dates, price, and guest count)
 * @param onDelete - Callback invoked with the booking id when the reservation is deleted
 * @returns A JSX element representing the reservation card
 */
function ReservationCard({ booking, onDelete }: ReservationCardProps) {
	const {
		id,
		startDate,
		endDate,
		numNights,
		totalPrice,
		numGuests,
		created_at,
		cabins: { name, image },
	} = booking;
	const startDateValue = new Date(startDate);
	const endDateValue = new Date(endDate);
	const createdAtValue = new Date(created_at);

	return (
		<div className="flex flex-col overflow-hidden rounded-lg border border-primary-800 bg-primary-950 sm:flex-row">
			<div className="relative h-52 w-full border-b border-primary-800 sm:h-auto sm:w-52 sm:border-b-0 sm:border-r md:w-60">
				<Image
					src={image ?? ""}
					alt={`Cabin ${name}`}
					fill
					sizes="(min-width: 768px) 240px, (min-width: 640px) 208px, 100vw"
					className="object-cover"
				/>
			</div>

			<div className="flex flex-grow flex-col gap-4 px-5 py-5 sm:px-6 sm:py-6">
				<div className="flex flex-wrap items-center gap-3 sm:gap-4">
					<h3 className="text-lg font-semibold sm:text-xl md:text-2xl">
						{numNights} nights in Cabin {name}
					</h3>
					{isPast(startDateValue) ? (
						<span className="flex items-center rounded-sm bg-yellow-800 px-3 py-1 text-[11px] font-bold uppercase text-yellow-200 sm:text-xs">
							past
						</span>
					) : (
						<span className="flex items-center rounded-sm bg-green-800 px-3 py-1 text-[11px] font-bold uppercase text-green-200 sm:text-xs">
							upcoming
						</span>
					)}
				</div>

				<p className="text-sm leading-relaxed text-primary-300 sm:text-base">
					{format(startDateValue, "EEE, MMM dd yyyy")} (
					{isToday(startDateValue)
						? "Today"
						: formatDistanceFromNow(startDateValue)}
					) &mdash; {format(endDateValue, "EEE, MMM dd yyyy")}
				</p>

				<div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 text-sm sm:text-base">
					<p className="text-lg font-semibold text-accent-400 sm:text-xl">
						${totalPrice}
					</p>
					<p className="text-primary-300">&bull;</p>
					<p className="text-primary-300">
						{numGuests} guest{numGuests > 1 && "s"}
					</p>
					<p className="ml-auto text-xs text-primary-400 sm:text-sm">
						Booked {format(createdAtValue, "EEE, MMM dd yyyy, p")}
					</p>
				</div>
			</div>

			{!isPast(startDateValue) ? (
				<div className="flex border-t border-primary-800 sm:w-40 sm:border-l sm:border-t-0">
					<div className="flex w-full divide-x divide-primary-800 sm:flex-col sm:divide-x-0 sm:divide-y">
						<Link
							href={`/account/reservations/edit/${id}`}
							className="group flex flex-1 items-center justify-center gap-2 px-4 py-3 text-[11px] font-bold uppercase text-primary-300 transition-colors hover:bg-accent-600 hover:text-primary-900 sm:justify-start sm:px-3 sm:py-4 sm:text-xs"
						>
							<PencilSquareIcon className="h-5 w-5 text-primary-600 transition-colors group-hover:text-primary-800" />
							<span className="mt-1">Edit</span>
						</Link>
						<DeleteReservation onDelete={onDelete} bookingId={id} />
					</div>
				</div>
			) : null}
		</div>
	);
}

export default ReservationCard;