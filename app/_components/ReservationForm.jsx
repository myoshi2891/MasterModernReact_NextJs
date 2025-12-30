"use client";

import {
	calculateCabinPrice,
	calculateNumNights,
} from "@/app/_lib/booking";
import { useReservation } from "./ReservationContext";
import { createBooking } from "../_lib/actions";
import SubmitButton from "./SubmitButton";
import Image from "next/image";

/**
 * Render a reservation form for a cabin that displays the logged-in user and collects guest count and observations.
 *
 * The form prepares booking data (dates, number of nights, calculated cabin price, cabin id, and capacity),
 * submits that data when the form is posted, and resets the selected date range after successful submission.
 *
 * @param {{ maxCapacity: number, regularPrice: number, discount: number, id: string|number }} cabin - Cabin data used to determine capacity and calculate price.
 * @param {{ name: string, image: string }} user - Logged-in user info displayed in the form header.
 * @returns {JSX.Element} A reservation UI element including user info, guest selector, observations textarea, and submit controls.
 */
function ReservationForm({ cabin, user }) {
	// CHANGE
	const { range, resetRange } = useReservation();
	const { maxCapacity, regularPrice, discount, id } = cabin;

	const startDate = range.from;
	const endDate = range.to;

	// Only calculate when both dates are selected
	const numNights = startDate && endDate ? calculateNumNights(startDate, endDate) : 0;
	const cabinPrice = startDate && endDate ? calculateCabinPrice(numNights, regularPrice, discount) : 0;

	const bookingData = {
		startDate,
		endDate,
		numNights,
		cabinPrice,
		cabinId: id,
		maxCapacity,
	};

	const createBookingWithData = createBooking.bind(null, bookingData);

	return (
		<div className="flex h-full flex-col">
				<div className="flex flex-col gap-2 bg-primary-800 px-4 py-4 text-xs text-primary-300 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:text-sm">
					<p className="uppercase tracking-wide text-primary-200">Logged in as</p>

					<div className="flex items-center gap-3">
					<Image
						// Important to display google profile images
						referrerPolicy="no-referrer"
						className="size-9 rounded-full object-cover"
						src={user.image}
						alt={user.name}
						width={36}
						height={36}
					/>
					<p className="font-medium text-primary-100">{user.name}</p>
				</div>
			</div>

				<form
				action={async (formData) => {
					await createBookingWithData(formData);
					resetRange();
				}}
				className="flex flex-1 flex-col gap-5 bg-primary-900 px-4 py-6 text-sm sm:gap-6 sm:px-8 sm:py-8 sm:text-base md:gap-7 md:px-10 md:py-10"
			>
				<div className="space-y-2">
					<label htmlFor="numGuests" className="text-xs uppercase tracking-wide text-primary-200 sm:text-sm">
						How many guests?
					</label>
					<select
						name="numGuests"
						id="numGuests"
						className="w-full rounded-sm bg-primary-200 px-4 py-3 text-sm text-primary-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-400 sm:text-base"
						required
					>
						<option value="" key="">
							Select guests...
						</option>
						{Array.from(
							{ length: maxCapacity },
							(_, i) => i + 1
						).map((x) => (
							<option value={x} key={x}>
								{x} {x === 1 ? "guest" : "guests"}
							</option>
						))}
					</select>
				</div>

				<div className="space-y-2">
					<label
						htmlFor="observations"
						className="text-xs uppercase tracking-wide text-primary-200 sm:text-sm"
					>
						Anything we should know about your stay?
					</label>
					<textarea
						name="observations"
						id="observations"
						className="h-28 w-full rounded-sm bg-primary-200 px-4 py-3 text-sm text-primary-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-400 sm:h-32 sm:text-base"
						placeholder="Any pets, allergies, special requirements, etc.?"
					/>
				</div>

					<div className="flex flex-col items-stretch gap-4 pt-2 sm:flex-row sm:justify-end sm:gap-6">
						{!(startDate && endDate) ? (
							<p className="text-xs text-primary-300 sm:text-sm">
								Start by selecting dates
							</p>
						) : (
							<SubmitButton
								pendingLabel="Reserving..."
								className="w-full text-sm sm:w-auto sm:text-base"
							>
								Reserve now
							</SubmitButton>
						)}{" "}
					</div>
			</form>
		</div>
	);
}

export default ReservationForm;