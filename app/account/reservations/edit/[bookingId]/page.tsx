import SubmitButton from "@/app/_components/SubmitButton";
import { updateBooking } from "@/app/_lib/actions";
import { getBooking } from "@/app/_lib/data-service";

interface PageParams {
	bookingId: string;
}

interface PageProps {
	params: Promise<PageParams>;
}

/**
 * Render an edit reservation page for the given booking.
 *
 * The page displays a form pre-filled with the booking's values (number of guests and observations)
 * and posts updates to the `updateBooking` action.
 *
 * @returns A React element containing the edit reservation form for the specified booking.
 * @throws If loading the booking data fails.
 */
export default async function Page({ params }: PageProps) {
	const { bookingId } = await params;
	let booking;

	try {
		booking = await getBooking(bookingId);
	} catch (error) {
		console.error(`Failed to load booking ${bookingId}:`, error);
		throw new Error(`Failed to load booking. Booking ID: ${bookingId}`);
	}

	// nullセーフな値の取得
	const numGuests = booking?.numGuests ?? 1;
	const observations = booking?.observations ?? "";
	const maxCapacity = booking?.cabins?.maxCapacity ?? 4;

	return (
		<div>
			<h2 className="mb-7 text-2xl font-semibold text-accent-400">
				Edit Reservation #{bookingId}
			</h2>

			<form
				action={updateBooking}
				className="flex flex-col gap-6 bg-primary-900 px-12 py-8 text-lg"
			>
				<input type="hidden" value={bookingId} name="bookingId" />
				<div className="space-y-2">
					<label htmlFor="numGuests">How many guests?</label>
					<select
						name="numGuests"
						id="numGuests"
						defaultValue={numGuests}
						className="w-full rounded-sm bg-primary-200 px-5 py-3 text-primary-800 shadow-sm"
						required
					>
						{Array.from({ length: maxCapacity }, (_, i) => i + 1).map((x) => (
							<option value={x} key={x}>
								{x} {x === 1 ? "guest" : "guests"}
							</option>
						))}
					</select>
				</div>

				<div className="space-y-2">
					<label htmlFor="observations">
						Anything we should know about your stay?
					</label>
					<textarea
						name="observations"
						defaultValue={observations}
						className="w-full rounded-sm bg-primary-200 px-5 py-3 text-primary-800 shadow-sm"
					/>
				</div>

				<div className="flex items-center justify-end gap-6">
					<SubmitButton pendingLabel="Updating...">
						Update reservation
					</SubmitButton>
				</div>
			</form>
		</div>
	);
}