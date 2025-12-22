import {
  differenceInCalendarDays,
  isPast,
  isSameDay,
  isWithinInterval,
} from "date-fns";

export function calculateNumNights(startDate, endDate) {
  return differenceInCalendarDays(endDate, startDate);
}

export function calculateCabinPrice(numNights, regularPrice, discount) {
  return numNights * (regularPrice - discount);
}

export function isRangeBooked(range, bookedDates) {
  return Boolean(
    range?.from &&
      range?.to &&
      bookedDates.some((date) =>
        isWithinInterval(date, { start: range.from, end: range.to })
      )
  );
}

export function isDateDisabled(date, bookedDates) {
  return isPast(date) || bookedDates.some((day) => isSameDay(day, date));
}

export function validateBookingInput({
  startDate,
  endDate,
  numNights,
  numGuests,
  maxCapacity,
}) {
  if (!startDate || !endDate) {
    throw new Error("Booking dates are required");
  }

  if (!Number.isFinite(numNights) || numNights <= 0) {
    throw new Error("Booking must be at least 1 night");
  }

  const guests = Number(numGuests);
  if (!Number.isFinite(guests) || guests <= 0) {
    throw new Error("Number of guests must be at least 1");
  }

  const capacity = Number(maxCapacity);
  if (Number.isFinite(capacity) && guests > capacity) {
    throw new Error("Number of guests exceeds cabin capacity");
  }
}
