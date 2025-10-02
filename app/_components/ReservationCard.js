import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { format, formatDistance, isPast, isToday, parseISO } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import DeleteReservation from "./DeleteReservation";

export const formatDistanceFromNow = (dateStr) =>
	formatDistance(parseISO(dateStr), new Date(), {
		addSuffix: true,
	}).replace("about ", "");

function ReservationCard({ booking, onDelete }) {
	const {
		id,
		guestId,
		startDate,
		endDate,
		numNights,
		totalPrice,
		numGuests,
		status,
		created_at,
		cabins: { name, image },
	} = booking;

	return (
		<div className="flex flex-col border border-primary-800 rounded-lg overflow-hidden bg-primary-950 sm:flex-row">
			<div className="relative h-52 w-full border-b border-primary-800 sm:h-auto sm:w-52 sm:border-b-0 sm:border-r md:w-60">
				<Image
					src={image}
					alt={`Cabin ${name}`}
					fill
					className="object-cover"
				/>
			</div>

			<div className="flex flex-col gap-4 px-5 py-5 sm:px-6 sm:py-6 flex-grow">
				<div className="flex flex-wrap items-center gap-3 sm:gap-4">
					<h3 className="text-lg font-semibold sm:text-xl md:text-2xl">
						{numNights} nights in Cabin {name}
					</h3>
					{isPast(new Date(startDate)) ? (
						<span className="bg-yellow-800 text-yellow-200 px-3 py-1 uppercase text-[11px] font-bold flex items-center rounded-sm sm:text-xs">
							past
						</span>
					) : (
						<span className="bg-green-800 text-green-200 px-3 py-1 uppercase text-[11px] font-bold flex items-center rounded-sm sm:text-xs">
							upcoming
						</span>
					)}
				</div>

				<p className="text-sm text-primary-300 leading-relaxed sm:text-base">
					{format(new Date(startDate), "EEE, MMM dd yyyy")} (
					{isToday(new Date(startDate))
						? "Today"
						: formatDistanceFromNow(startDate)}
					) &mdash; {format(new Date(endDate), "EEE, MMM dd yyyy")}
				</p>

				<div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-auto text-sm sm:text-base">
					<p className="text-lg font-semibold text-accent-400 sm:text-xl">
						${totalPrice}
					</p>
					<p className="text-primary-300">&bull;</p>
					<p className="text-primary-300">
						{numGuests} guest{numGuests > 1 && "s"}
					</p>
					<p className="ml-auto text-xs text-primary-400 sm:text-sm">
						Booked{" "}
						{format(new Date(created_at), "EEE, MMM dd yyyy, p")}
					</p>
				</div>
			</div>

			{!isPast(new Date(startDate)) ? (
				<div className="flex border-t border-primary-800 sm:border-t-0 sm:border-l sm:w-40">
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
