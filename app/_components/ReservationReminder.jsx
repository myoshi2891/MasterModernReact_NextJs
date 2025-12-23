"use client";

import { XMarkIcon } from "@heroicons/react/24/solid";
import { format } from "date-fns";
import { useReservation } from "./ReservationContext";

/**
 * Display a dismissible banner showing the selected reservation date range when both start and end dates are set.
 *
 * Renders a fixed, styled reminder with the formatted `range.from` and `range.to` dates and a close button that clears the range.
 * @returns {JSX.Element|null} The reminder banner element, or `null` when either `range.from` or `range.to` is missing.
 */
function ReservationReminder() {
	const { range, resetRange } = useReservation();
	if (!range.from || !range.to) return null;

	return (
		<div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-3xl bg-accent-500 px-5 py-4 text-center font-semibold text-primary-800 shadow-xl shadow-slate-900/80 sm:bottom-6 sm:w-auto sm:max-w-none sm:px-8 sm:py-5 sm:text-left">
			<div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
				<p className="text-sm leading-relaxed sm:text-base">
					<span className="mr-1">👋</span> Don&apos;t forget to reserve your dates
					<br className="hidden sm:block" />
					from {format(new Date(range.from), "MMM dd yyyy")} to {" "}
					{format(new Date(range.to), "MMM dd yyyy")}
				</p>
				<button
					type="button"
					className="rounded-full p-1 transition-colors duration-150 hover:bg-accent-600"
					onClick={resetRange}
				>
					<XMarkIcon className="h-5 w-5" />
				</button>
			</div>
		</div>
	);
}

export default ReservationReminder;