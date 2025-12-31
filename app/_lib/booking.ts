import {
  differenceInCalendarDays,
  isBefore,
  isSameDay,
  isWithinInterval,
  startOfDay,
} from "date-fns";

/**
 * Date range type for booking selection.
 * Compatible with react-day-picker's DateRange type.
 */
export interface DateRange {
  from: Date | undefined;
  to?: Date | undefined;
}

/**
 * Input parameters for booking validation.
 */
export interface BookingValidationInput {
  startDate: string | Date | null;
  endDate: string | Date | null;
  numNights: number;
  numGuests: number | string;
  maxCapacity?: number | string | null;
  regularPrice?: number | string | null;
  discount?: number | string | null;
}

/**
 * Calculate the number of nights between two dates using calendar-day difference.
 * @param startDate - The start (check-in) date.
 * @param endDate - The end (check-out) date.
 * @returns The number of nights as the difference in calendar days between endDate and startDate.
 * @throws Error If either date is invalid (e.g., new Date("invalid")).
 * @throws Error If endDate is not after startDate.
 */
export function calculateNumNights(startDate: Date, endDate: Date): number {
  if (
    !startDate ||
    !endDate ||
    isNaN(startDate.getTime()) ||
    isNaN(endDate.getTime())
  ) {
    throw new Error("Invalid dates provided to calculateNumNights");
  }
  if (!isBefore(startDate, endDate)) {
    throw new Error("End date must be after start date");
  }
  // Use calendar days to avoid DST offsets shifting night counts.
  return differenceInCalendarDays(endDate, startDate);
}

/**
 * Calculate the total price for a cabin stay by applying a per-night discount.
 * @param numNights - Number of nights for the stay.
 * @param regularPrice - Regular price per night.
 * @param discount - Discount amount applied per night.
 * @returns Total price for the stay (numNights × (regularPrice − discount)).
 * @throws Error If numNights is not a non-negative finite number.
 * @throws Error If regularPrice is not a non-negative finite number.
 * @throws Error If discount is not a non-negative finite number.
 * @throws Error If discount exceeds regularPrice.
 */
export function calculateCabinPrice(
  numNights: number,
  regularPrice: number,
  discount: number
): number {
  if (!Number.isFinite(numNights) || numNights < 0) {
    throw new Error("numNights must be a non-negative finite number");
  }
  if (!Number.isFinite(regularPrice) || regularPrice < 0) {
    throw new Error("regularPrice must be a non-negative finite number");
  }
  if (!Number.isFinite(discount) || discount < 0) {
    throw new Error("discount must be a non-negative finite number");
  }
  if (discount > regularPrice) {
    throw new Error("discount cannot exceed regularPrice");
  }
  return numNights * (regularPrice - discount);
}

/**
 * Determine whether any booked date falls inside a given date range.
 * @param range - Date range with `from` and `to` boundaries (inclusive). Both `from` and `to` must be present for a match to be considered.
 * @param bookedDates - Array of booked dates; `null` or `undefined` is treated as an empty list.
 * @returns `true` if at least one booked date is within the inclusive range, `false` otherwise.
 */
export function isRangeBooked(
  range: DateRange | null | undefined,
  bookedDates: Date[] | null | undefined
): boolean {
  const dates = bookedDates ?? [];
  return Boolean(
    range?.from &&
      range?.to &&
      dates.some((date) =>
        isWithinInterval(date, { start: range.from!, end: range.to! })
      )
  );
}

/**
 * Determines whether a date should be disabled for booking.
 * @param date - The date to check.
 * @param bookedDates - An array of already booked dates; treated as empty when `null` or `undefined`.
 * @returns `true` if the date is before today (date-only comparison) or matches any booked date, `false` otherwise.
 */
export function isDateDisabled(
  date: Date,
  bookedDates: Date[] | null | undefined
): boolean {
  const dates = bookedDates ?? [];
  // Use date-only comparison (consistent with validateBookingInput)
  return (
    isBefore(startOfDay(date), startOfDay(new Date())) ||
    dates.some((day) => isSameDay(day, date))
  );
}

/**
 * Validate booking input fields and throw an Error when any validation rule fails.
 *
 * @throws Error When dates are missing or invalid: "Booking dates are required".
 * @throws Error When end date is not after start date: "End date must be after start date".
 * @throws Error When start date is in the past: "Booking date cannot be in the past".
 * @throws Error When `numNights` is not a positive finite number: "Booking must be at least 1 night".
 * @throws Error When `numNights` does not match the date range: "Number of nights does not match date range".
 * @throws Error When `numGuests` is not a positive finite number: "Number of guests must be at least 1".
 * @throws Error When `maxCapacity` is numeric and `numGuests` exceeds it: "Number of guests exceeds cabin capacity".
 * @throws Error When `regularPrice` is numeric and negative: "Regular price must be a non-negative number".
 * @throws Error When `discount` is numeric and negative: "Discount must be a non-negative number".
 * @throws Error When `discount` exceeds `regularPrice`: "Discount cannot exceed regular price".
 */
export function validateBookingInput({
  startDate,
  endDate,
  numNights,
  numGuests,
  maxCapacity,
  regularPrice,
  discount,
}: BookingValidationInput): void {
  const parsedStart = startDate ? new Date(startDate) : null;
  const parsedEnd = endDate ? new Date(endDate) : null;

  if (
    !parsedStart ||
    !parsedEnd ||
    Number.isNaN(parsedStart.getTime()) ||
    Number.isNaN(parsedEnd.getTime())
  ) {
    throw new Error("Booking dates are required");
  }

  if (!isBefore(parsedStart, parsedEnd)) {
    throw new Error("End date must be after start date");
  }

  if (isBefore(parsedStart, startOfDay(new Date()))) {
    throw new Error("Booking date cannot be in the past");
  }

  const actualNights = differenceInCalendarDays(parsedEnd, parsedStart);

  if (!Number.isFinite(numNights) || numNights <= 0) {
    throw new Error("Booking must be at least 1 night");
  }

  if (numNights !== actualNights) {
    throw new Error("Number of nights does not match date range");
  }

  const guests = Number(numGuests);
  if (!Number.isFinite(guests) || guests <= 0) {
    throw new Error("Number of guests must be at least 1");
  }

  const capacity = Number(maxCapacity);
  if (Number.isFinite(capacity) && guests > capacity) {
    throw new Error("Number of guests exceeds cabin capacity");
  }

  const price = Number(regularPrice);
  if (
    regularPrice !== null &&
    regularPrice !== undefined &&
    (!Number.isFinite(price) || price < 0)
  ) {
    throw new Error("Regular price must be a non-negative number");
  }

  const discountValue = Number(discount);
  if (
    discount !== null &&
    discount !== undefined &&
    (!Number.isFinite(discountValue) || discountValue < 0)
  ) {
    throw new Error("Discount must be a non-negative number");
  }

  if (
    Number.isFinite(price) &&
    Number.isFinite(discountValue) &&
    discountValue > price
  ) {
    throw new Error("Discount cannot exceed regular price");
  }
}
