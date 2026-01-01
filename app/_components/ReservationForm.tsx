"use client";

import { useMemo } from "react";
import { calculateNumNights } from "@/app/_lib/booking";
import { useReservation } from "./ReservationContext";
import { createBooking, type CreateBookingData } from "../_lib/actions";
import SubmitButton from "./SubmitButton";
import Image from "next/image";

interface CabinData {
	maxCapacity: number;
	id: number;
}

interface UserData {
	name: string;
	image?: string;
}

interface ReservationFormProps {
	cabin: CabinData;
	user: UserData;
}

/**
 * Render a reservation form that displays the logged-in user and collects guest count and observations for booking a cabin.
 *
 * The component prepares booking metadata (startDate and endDate as null when absent, calculated `numNights`, and `cabinId`) and binds it to the server action that handles form submissions. When the form is submitted successfully the selected date range is reset; if submission fails the date range is preserved.
 *
 * @returns A JSX element containing the reservation form UI.
 */
function ReservationForm({ cabin, user }: ReservationFormProps) {
	const { range, resetRange } = useReservation();
	const { maxCapacity, id } = cabin;
	const userImage = user.image;

	const startDate = range.from;
	const endDate = range.to;

	// Only calculate when both dates are selected
	const numNights =
		startDate && endDate ? calculateNumNights(startDate, endDate) : 0;

	// Generate a unique client request ID for idempotency
	// This ID stays the same for a given date range + cabin combination
	// and regenerates when the user changes dates
	const clientRequestId = useMemo(() => {
		if (!startDate || !endDate) return undefined;
		return crypto.randomUUID();
	}, [startDate?.getTime(), endDate?.getTime(), id]);

	const bookingData: CreateBookingData = {
		startDate: startDate ?? null,
		endDate: endDate ?? null,
		numNights,
		cabinId: id,
		clientRequestId,
	};

	const createBookingWithData = createBooking.bind(null, bookingData);

	return (
		<div className="flex h-full flex-col">
			<div className="flex flex-col gap-2 bg-primary-800 px-4 py-4 text-xs text-primary-300 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:text-sm">
				<p className="uppercase tracking-wide text-primary-200">Logged in as</p>

				<div className="flex items-center gap-3">
					{userImage ? (
						<Image
							referrerPolicy="no-referrer"
							className="size-9 rounded-full object-cover"
							src={userImage}
							alt={user.name}
							width={36}
							height={36}
						/>
					) : (
						<span className="flex size-9 items-center justify-center rounded-full bg-primary-600 text-sm font-medium text-primary-100">
							{user.name.charAt(0).toUpperCase()}
						</span>
					)}
					<p className="font-medium text-primary-100">{user.name}</p>
				</div>
			</div>

			<form
				action={async (formData) => {
					try {
						await createBookingWithData(formData);
						resetRange();
					} catch (error) {
						// エラー時は日付選択を保持（Server Actionはエラーを再スローするのでUIに伝播）
						throw error;
					}
				}}
				className="flex flex-1 flex-col gap-5 bg-primary-900 px-4 py-6 text-sm sm:gap-6 sm:px-8 sm:py-8 sm:text-base md:gap-7 md:px-10 md:py-10"
			>
				<div className="space-y-2">
					<label
						htmlFor="numGuests"
						className="text-xs uppercase tracking-wide text-primary-200 sm:text-sm"
					>
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
						{Array.from({ length: maxCapacity }, (_, i) => i + 1).map((x) => (
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