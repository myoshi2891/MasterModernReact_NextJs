"use client";

import { useMemo } from "react";
import { calculateNumNights } from "@/app/_lib/booking";
import { useReservation } from "./ReservationContext";
import { createBooking, type CreateBookingData } from "../_lib/actions";
import SubmitButton from "./SubmitButton";
import Image from "next/image";
import { useLanguage } from "./LanguageContext";

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
 * Render a reservation form that displays the logged-in user and collects guest count and observations to create a cabin booking.
 *
 * The form action awaits `createBookingWithData` (a Server Action bound with booking metadata)
 * and then calls `resetRange` to clear the selected dates. If the Server Action throws, the error
 * propagates to the nearest Error Boundary and `resetRange` is not called, preserving the user's
 * date selection.
 *
 * @returns A JSX element containing the reservation form UI
 */
// TODO: useActionState + useFormStatus でクライアント側エラーフィードバックを表示し、
/**
 * Render a reservation form for a specific cabin and the currently logged-in user.
 *
 * Shows the user's identity (image or initial), collects number of guests and observations,
 * disables submission until both start and end dates are selected, and submits a bound
 * Server Action to create a booking. After a successful submission the selected date range
 * is cleared. A clientRequestId used for idempotency is generated when both dates are present
 * and is tied to the cabin + date range.
 *
 * @param cabin - Cabin data; expected to include `maxCapacity` and `id`
 * @param user - User data; expected to include `name` and optional `image`
 * @returns The reservation form JSX element
 */
function ReservationForm({ cabin, user }: ReservationFormProps) {
	const { t } = useLanguage();
	const { range, resetRange } = useReservation();
	const { maxCapacity, id } = cabin;
	const userImage = user.image;

	const startDate = range.from;
	const endDate = range.to;

	// Only calculate when both dates are selected
	const numNights =
		startDate && endDate ? calculateNumNights(startDate, endDate) : 0;

	// 日付は値（getTime）で比較するため、依存配列を単純式にできるよう
	// あらかじめタイムスタンプへ変換しておく（react-hooks/use-memo 対応）
	const startTime = startDate?.getTime();
	const endTime = endDate?.getTime();

	// Generate a unique client request ID for idempotency
	// This ID stays the same for a given date range + cabin combination
	// and regenerates when the user changes dates
	const clientRequestId = useMemo(() => {
		if (startTime == null || endTime == null) return undefined;
		return crypto.randomUUID();
		// id は cabin 変更時に冪等キーを再生成するための意図的な依存
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [startTime, endTime, id]);

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
				<p className="uppercase tracking-wide text-primary-200">{t.reservationForm.loggedInAs}</p>

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
					await createBookingWithData(formData);
					resetRange();
				}}
				className="flex flex-1 flex-col gap-5 bg-primary-900 px-4 py-6 text-sm sm:gap-6 sm:px-8 sm:py-8 sm:text-base md:gap-7 md:px-10 md:py-10"
			>
				<div className="space-y-2">
					<label
						htmlFor="numGuests"
						className="text-xs uppercase tracking-wide text-primary-200 sm:text-sm"
					>
						{t.reservationForm.guestsLabel}
					</label>
					<select
						name="numGuests"
						id="numGuests"
						className="w-full rounded-sm bg-primary-200 px-4 py-3 text-sm text-primary-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-400 sm:text-base"
						required
					>
						<option value="" key="">
							{t.reservationForm.selectGuests}
						</option>
						{Array.from({ length: maxCapacity }, (_, i) => i + 1).map((x) => (
							<option value={x} key={x}>
								{x} {x === 1 ? t.reservationForm.guestSingle : t.reservationForm.guestPlural}
							</option>
						))}
					</select>
				</div>

				<div className="space-y-2">
					<label
						htmlFor="observations"
						className="text-xs uppercase tracking-wide text-primary-200 sm:text-sm"
					>
						{t.reservationForm.observationsLabel}
					</label>
					<textarea
						name="observations"
						id="observations"
						className="h-28 w-full rounded-sm bg-primary-200 px-4 py-3 text-sm text-primary-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-400 sm:h-32 sm:text-base"
						placeholder={t.reservationForm.observationsPlaceholder}
					/>
				</div>

				<div className="flex flex-col items-stretch gap-4 pt-2 sm:flex-row sm:justify-end sm:gap-6">
					{!(startDate && endDate) ? (
						<p className="text-xs text-primary-300 sm:text-sm">
							{t.reservationForm.startBySelecting}
						</p>
					) : (
						<SubmitButton
							pendingLabel={t.reservationForm.reserving}
							className="w-full text-sm sm:w-auto sm:text-base"
						>
							{t.reservationForm.reserveNow}
						</SubmitButton>
					)}{" "}
				</div>
			</form>
		</div>
	);
}

export default ReservationForm;