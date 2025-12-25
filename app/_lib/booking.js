import {
  differenceInCalendarDays,
  isBefore,
  isPast,
  isSameDay,
  isWithinInterval,
  startOfDay,
} from "date-fns";

/**
 * Calculate the number of nights between two dates using calendar-day difference.
 * @param {Date} startDate - The start (check-in) date.
 * @param {Date} endDate - The end (check-out) date.
 * @returns {number} The number of nights as the difference in calendar days between endDate and startDate.
 */
export function calculateNumNights(startDate, endDate) {
  // Use calendar days to avoid DST offsets shifting night counts.
  return differenceInCalendarDays(endDate, startDate);
}

/**
 * Calculate the total price for a cabin stay by applying a per-night discount.
 * @param {number} numNights - Number of nights for the stay.
 * @param {number} regularPrice - Regular price per night.
 * @param {number} discount - Discount amount applied per night.
 * @return {number} Total price for the stay (numNights × (regularPrice − discount)).
 */
export function calculateCabinPrice(numNights, regularPrice, discount) {
  return numNights * (regularPrice - discount);
}

/**
 * Determine whether any booked date falls inside a given date range.
 * @param {{from: Date, to: Date}} range - Date range with `from` and `to` boundaries (inclusive). Both `from` and `to` must be present for a match to be considered.
 * @param {Date[]|null|undefined} bookedDates - Array of booked dates; `null` or `undefined` is treated as an empty list.
 * @returns {boolean} `true` if at least one booked date is within the inclusive range, `false` otherwise.
 */
export function isRangeBooked(range, bookedDates) {
  const dates = bookedDates ?? [];
  return Boolean(
    range?.from &&
      range?.to &&
      dates.some((date) =>
        isWithinInterval(date, { start: range.from, end: range.to })
      )
  );
}

/**
 * Determines whether a date should be disabled for booking.
 * @param {Date} date - The date to check.
 * @param {Date[]|null|undefined} bookedDates - An array of already booked dates; treated as empty when `null` or `undefined`.
 * @returns {boolean} `true` if the date is in the past or matches any booked date, `false` otherwise.
 */
export function isDateDisabled(date, bookedDates) {
  const dates = bookedDates ?? [];
  return isPast(date) || dates.some((day) => isSameDay(day, date));
}

/**
 * Validate booking input fields and throw an Error when any validation rule fails.
 *
 * @param {{startDate: string|Date|null, endDate: string|Date|null, numNights: number, numGuests: number|string, maxCapacity?: number|string|null, regularPrice?: number|string|null, discount?: number|string|null}} params
 * @param {string|Date|null} params.startDate - Booking start date; must be a valid date not in the past.
 * @param {string|Date|null} params.endDate - Booking end date; must be a valid date after `startDate`.
 * @param {number} params.numNights - Declared number of nights; must equal the calendar-day difference between `endDate` and `startDate` and be at least 1.
 * @param {number|string} params.numGuests - Number of guests; must be at least 1 (string values will be coerced to numbers).
 * @param {number|string|null} [params.maxCapacity] - Optional cabin capacity; if provided and numeric, `numGuests` must not exceed it.
 * @param {number|string|null} [params.regularPrice] - Optional regular price; if provided and numeric, must be a non-negative number.
 * @param {number|string|null} [params.discount] - Optional per-night discount; if provided and numeric, must be between 0 and `regularPrice`.
 *
 * @throws {Error} When dates are missing or invalid: "Booking dates are required".
 * @throws {Error} When end date is not after start date: "End date must be after start date".
 * @throws {Error} When start date is in the past: "Booking date cannot be in the past".
 * @throws {Error} When `numNights` is not a positive finite number: "Booking must be at least 1 night".
 * @throws {Error} When `numNights` does not match the date range: "Number of nights does not match date range".
 * @throws {Error} When `numGuests` is not a positive finite number: "Number of guests must be at least 1".
 * @throws {Error} When `maxCapacity` is numeric and `numGuests` exceeds it: "Number of guests exceeds cabin capacity".
 * @throws {Error} When `regularPrice` is numeric and negative: "Regular price must be a non-negative number".
 * @throws {Error} When `discount` is numeric and negative: "Discount must be a non-negative number".
 * @throws {Error} When `discount` exceeds `regularPrice`: "Discount cannot exceed regular price".
 */
export function validateBookingInput({
  startDate,
  endDate,
  numNights,
  numGuests,
  maxCapacity,
  regularPrice,
  discount,
}) {
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
