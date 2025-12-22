import {
  differenceInCalendarDays,
  isBefore,
  isPast,
  isSameDay,
  isWithinInterval,
  startOfDay,
} from "date-fns";

export function calculateNumNights(startDate, endDate) {
  // Use calendar days to avoid DST offsets shifting night counts.
  return differenceInCalendarDays(endDate, startDate);
}

export function calculateCabinPrice(numNights, regularPrice, discount) {
  return numNights * (regularPrice - discount);
}

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
}
