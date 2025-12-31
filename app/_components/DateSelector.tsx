"use client";

import {
	calculateCabinPrice,
	calculateNumNights,
	isDateDisabled,
	isRangeBooked,
} from "@/app/_lib/booking";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { DayPicker, type DateRange as DayPickerDateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useReservation } from "./ReservationContext";
import type { Settings, Cabin } from "@/types/domain";

interface DateSelectorProps {
	settings: Settings;
	cabin: Pick<Cabin, "regularPrice" | "discount">;
	bookedDates: Date[];
}

interface CustomCSSProperties extends CSSProperties {
	"--rdp-cell-size"?: string;
}

/**
 * Renders a responsive date-range selector and booking summary for a cabin, enforcing min/max nights, disabling booked dates, and showing per-night and total pricing.
 */
function DateSelector({ settings, cabin, bookedDates }: DateSelectorProps) {
	const { range, setRange, resetRange } = useReservation();

	const isBooked = isRangeBooked(range, bookedDates);
	const displayRange: DayPickerDateRange | undefined = isBooked
		? undefined
		: range;

	const { regularPrice, discount } = cabin;
	const numNights =
		displayRange?.from && displayRange?.to
			? calculateNumNights(displayRange.from, displayRange.to)
			: 0;
	const cabinPrice =
		displayRange?.from && displayRange?.to
			? calculateCabinPrice(numNights, regularPrice, discount)
			: 0;
	const { minBookingLength, maxBookingLength } = settings;
	const [monthsToShow, setMonthsToShow] = useState(2);
	const isSingleMonth = monthsToShow === 1;

	const handleSelect = useCallback(
		(newRange: DayPickerDateRange | undefined) => {
			setRange(newRange ?? { from: undefined, to: undefined });
		},
		[setRange]
	);

	useEffect(() => {
		const mediaQuery = window.matchMedia("(max-width: 768px)");
		const updateMonths = () => {
			const nextValue = mediaQuery.matches ? 1 : 2;
			setMonthsToShow((current) =>
				current === nextValue ? current : nextValue
			);
		};

		updateMonths();
		if (mediaQuery.addEventListener)
			mediaQuery.addEventListener("change", updateMonths);
		else mediaQuery.addListener(updateMonths);

		return () => {
			if (mediaQuery.removeEventListener)
				mediaQuery.removeEventListener("change", updateMonths);
			else mediaQuery.removeListener(updateMonths);
		};
	}, []);

	return (
		<div
			className={`flex w-full flex-col bg-primary-950 ${
				isSingleMonth
					? "gap-6 px-3 pb-6 sm:px-6"
					: "items-center gap-8 px-6 py-6 lg:px-10"
			}`}
		>
			<DayPicker
				className={`w-full self-center pt-6 transition-all sm:pt-10 ${
					isSingleMonth
						? "max-w-[min(17.25rem,_100%)] [&_.rdp-caption_dropdowns]:flex [&_.rdp-caption_dropdowns]:flex-col [&_.rdp-caption_dropdowns]:items-stretch [&_.rdp-caption_dropdowns]:gap-1.5 [&_.rdp-caption]:w-full [&_.rdp-dropdown]:w-full [&_.rdp-dropdown]:text-xs [&_.rdp-head_cell]:text-[0.65rem] [&_.rdp-head_cell]:tracking-wide sm:[&_.rdp-caption_dropdowns]:flex-row sm:[&_.rdp-caption_dropdowns]:items-center sm:[&_.rdp-caption_dropdowns]:justify-center sm:[&_.rdp-dropdown]:w-auto sm:[&_.rdp-dropdown]:text-sm"
						: "max-w-3xl"
				}`}
				mode="range"
				onSelect={handleSelect}
				selected={displayRange}
				min={minBookingLength + 1}
				max={maxBookingLength}
				fromMonth={new Date()}
				fromDate={new Date()}
				toYear={new Date().getFullYear() + 5}
				captionLayout="dropdown"
				numberOfMonths={monthsToShow}
				style={
					{
						"--rdp-cell-size": isSingleMonth
							? "clamp(1.65rem, 9vw, 2.1rem)"
							: "2.4rem",
					} as CustomCSSProperties
				}
				disabled={(curDate) => isDateDisabled(curDate, bookedDates)}
			/>

			<div
				className={`flex w-full flex-col gap-4 bg-accent-500 text-primary-800 sm:flex-row sm:items-center sm:justify-between ${
					isSingleMonth
						? "max-w-[min(17.25rem,_100%)] self-center rounded-lg px-4 py-4 shadow-lg"
						: "max-w-3xl self-stretch rounded-lg px-6 py-4"
				}`}
			>
				<div className="flex flex-wrap items-center gap-x-6 gap-y-3">
					<p className="flex items-baseline gap-2 text-base sm:text-xl">
						{discount > 0 ? (
							<>
								<span className="text-lg sm:text-2xl">
									${regularPrice - discount}
								</span>
								<span className="font-semibold text-primary-700 line-through">
									${regularPrice}
								</span>
							</>
						) : (
							<span className="text-lg sm:text-2xl">${regularPrice}</span>
						)}
						<span>/night</span>
					</p>
					{numNights ? (
						<>
							<p className="bg-accent-600 px-3 py-2 text-base sm:text-2xl">
								<span>&times;</span> <span>{numNights}</span>
							</p>
							<p className="text-sm sm:text-lg">
								<span className="font-bold uppercase">Total</span>{" "}
								<span className="text-lg font-semibold sm:text-2xl">
									${cabinPrice}
								</span>
							</p>
						</>
					) : null}
				</div>

				{range.from || range.to ? (
					<button
						type="button"
						className={`border border-primary-800 px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-150 hover:bg-primary-900/80 sm:text-sm ${
							isSingleMonth
								? "self-stretch text-center sm:ml-auto sm:w-auto sm:self-auto"
								: "self-auto sm:ml-auto"
						}`}
						onClick={resetRange}
					>
						Clear
					</button>
				) : null}
			</div>
		</div>
	);
}

export default DateSelector;