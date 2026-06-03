"use client";

import {
	calculateCabinPrice,
	calculateNumNights,
	isDateDisabled,
	isRangeBooked,
} from "@/app/_lib/booking";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { DayPicker, type DateRange as DayPickerDateRange, type OnSelectHandler } from "react-day-picker";
import "react-day-picker/style.css";
import { useReservation } from "./ReservationContext";
import type { Settings, Cabin } from "@/types/domain";
import { useLanguage } from "./LanguageContext";

interface DateSelectorProps {
	settings: Settings;
	cabin: Pick<Cabin, "regularPrice" | "discount">;
	bookedDates: Date[];
}

interface CustomCSSProperties extends CSSProperties {
	"--rdp-day-width"?: string;
	"--rdp-day-height"?: string;
}

/**
 * Renders a responsive date-range picker and live booking summary for a cabin.
 *
 * @param settings - Booking settings; used to enforce minimum and maximum nights.
 * @param cabin - Cabin pricing info (e.g., `regularPrice` and `discount`) used to compute per-night and total price.
 * @param bookedDates - Dates that are unavailable for selection; disabled in the picker and used to detect booked ranges.
 * @returns A JSX element that displays the date-range selector and a live per-night and total price summary.
 */
function DateSelector({ settings, cabin, bookedDates }: DateSelectorProps) {
	const { t } = useLanguage();
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
	const dayCellSize = isSingleMonth ? "clamp(1.65rem, 9vw, 2.1rem)" : "2.4rem";

	const handleSelect: OnSelectHandler<DayPickerDateRange | undefined> = useCallback(
		(newRange) => {
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

	const today = new Date();

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
					isSingleMonth ? "max-w-[min(17.25rem,_100%)]" : "max-w-3xl"
				}`}
				mode="range"
				onSelect={handleSelect}
				selected={displayRange}
				min={minBookingLength + 1}
				max={maxBookingLength}
				startMonth={today}
				endMonth={new Date(today.getFullYear() + 5, 11)}
				captionLayout="dropdown"
				numberOfMonths={monthsToShow}
				style={
					{
						"--rdp-day-width": dayCellSize,
						"--rdp-day-height": dayCellSize,
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
						<span>{t.dateSelector.perNight}</span>
					</p>
					{numNights ? (
						<>
							<p className="bg-accent-600 px-3 py-2 text-base sm:text-2xl">
								<span>&times;</span> <span>{numNights}</span>
							</p>
							<p className="text-sm sm:text-lg">
								<span className="font-bold uppercase">{t.dateSelector.total}</span>{" "}
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
						{t.dateSelector.clear}
					</button>
				) : null}
			</div>
		</div>
	);
}

export default DateSelector;