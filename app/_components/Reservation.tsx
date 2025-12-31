import { auth } from "../_lib/auth";
import { getBookedDatesByCabinId, getSettings } from "../_lib/data-service";
import DateSelector from "./DateSelector";
import LoginMessage from "./LoginMessage";
import ReservationForm from "./ReservationForm";
import type { Cabin } from "@/types/domain";

interface ReservationProps {
	cabin: Cabin;
}

/**
 * Render the reservation UI for a specific cabin, including date selection and a user-facing booking area.
 *
 * Fetches required settings and booked dates before rendering; shows the reservation form populated with
 * the authenticated user's summary when signed in, or a login prompt otherwise.
 *
 * @param cabin - The cabin to display reservation controls for
 * @returns The reservation UI element containing a date selector and either a reservation form for authenticated users or a login message
 */
async function Reservation({ cabin }: ReservationProps) {
	const [settings, bookedDates] = await Promise.all([
		getSettings(),
		getBookedDatesByCabinId(cabin.id),
	]);

	const session = await auth();

	return (
		<div className="w-full px-3 sm:px-0">
			<div className="mx-auto grid min-h-[400px] w-full max-w-3xl grid-cols-1 overflow-hidden rounded-2xl border border-primary-800 bg-primary-950 lg:max-w-none lg:grid-cols-[1.1fr_1fr]">
				<DateSelector
					settings={settings}
					bookedDates={bookedDates}
					cabin={cabin}
				/>
				{session?.user ? (
					<ReservationForm
						cabin={cabin}
						user={{
							name: session.user.name ?? "Guest",
							image: session.user.image ?? "",
						}}
					/>
				) : (
					<LoginMessage />
				)}{" "}
			</div>
		</div>
	);
}

export default Reservation;