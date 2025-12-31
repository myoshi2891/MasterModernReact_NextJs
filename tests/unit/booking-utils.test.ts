import { describe, it, expect, vi } from "vitest";
import type { DateRange } from "react-day-picker";
import {
  calculateCabinPrice,
  calculateNumNights,
  isDateDisabled,
  isRangeBooked,
  validateBookingInput,
} from "../../app/_lib/booking";

describe("booking utils", () => {
  it("throws an error for same-day dates (end must be after start)", () => {
    const start = new Date("2025-01-01T00:00:00.000Z");
    const end = new Date("2025-01-01T00:00:00.000Z");

    expect(() => calculateNumNights(start, end)).toThrow(
      "End date must be after start date"
    );
  });

  it("calculates nights across a multi-day range", () => {
    const start = new Date("2025-01-01T00:00:00.000Z");
    const end = new Date("2025-01-04T00:00:00.000Z");

    expect(calculateNumNights(start, end)).toBe(3);
  });

  it("throws an error when the end date is before start", () => {
    const start = new Date("2025-01-05T00:00:00.000Z");
    const end = new Date("2025-01-03T00:00:00.000Z");

    expect(() => calculateNumNights(start, end)).toThrow(
      "End date must be after start date"
    );
  });

  it("handles PST dates without shifting nights", () => {
    const start = new Date("2025-02-01T00:00:00-08:00");
    const end = new Date("2025-02-02T00:00:00-08:00");

    expect(calculateNumNights(start, end)).toBe(1);
  });

  it("handles JST dates without shifting nights", () => {
    const start = new Date("2025-02-01T00:00:00+09:00");
    const end = new Date("2025-02-02T00:00:00+09:00");

    expect(calculateNumNights(start, end)).toBe(1);
  });

  it("handles a DST boundary without shifting nights", () => {
    const start = new Date("2025-03-09T00:00:00-08:00");
    const end = new Date("2025-03-10T00:00:00-07:00");

    expect(calculateNumNights(start, end)).toBe(1);
  });

  it("calculates cabin price with a discount", () => {
    expect(calculateCabinPrice(3, 200, 50)).toBe(450);
  });

  it("calculates cabin price without a discount", () => {
    expect(calculateCabinPrice(2, 150, 0)).toBe(300);
  });

  it("returns false when the range is incomplete", () => {
    const range: DateRange = { from: new Date("2025-01-01T00:00:00.000Z") };
    const bookedDates = [new Date("2025-01-02T00:00:00.000Z")];

    expect(isRangeBooked(range, bookedDates)).toBe(false);
  });

  it("detects a booked date inside the range", () => {
    const range: DateRange = {
      from: new Date("2025-01-01T00:00:00.000Z"),
      to: new Date("2025-01-05T00:00:00.000Z"),
    };
    const bookedDates = [new Date("2025-01-03T00:00:00.000Z")];

    expect(isRangeBooked(range, bookedDates)).toBe(true);
  });

  it("ignores booked dates outside the range", () => {
    const range: DateRange = {
      from: new Date("2025-01-01T00:00:00.000Z"),
      to: new Date("2025-01-02T00:00:00.000Z"),
    };
    const bookedDates = [new Date("2025-01-03T00:00:00.000Z")];

    expect(isRangeBooked(range, bookedDates)).toBe(false);
  });

  it("treats missing booked dates as an empty list", () => {
    const range: DateRange = {
      from: new Date("2025-01-01T00:00:00.000Z"),
      to: new Date("2025-01-02T00:00:00.000Z"),
    };

    expect(isRangeBooked(range, null)).toBe(false);
  });

  it("disables past dates", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-10T12:00:00.000Z"));

    const pastDate = new Date("2025-01-09T00:00:00.000Z");

    expect(isDateDisabled(pastDate, [])).toBe(true);

    vi.useRealTimers();
  });

  it("disables dates that are already booked", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-10T12:00:00.000Z"));

    const bookedDate = new Date("2025-01-12T00:00:00.000Z");

    expect(isDateDisabled(bookedDate, [bookedDate])).toBe(true);

    vi.useRealTimers();
  });

  it("allows future dates that are not booked", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-10T12:00:00.000Z"));

    const futureDate = new Date("2025-01-12T00:00:00.000Z");

    expect(isDateDisabled(futureDate, [])).toBe(false);

    vi.useRealTimers();
  });

  it("rejects missing start dates", () => {
    expect(() =>
      validateBookingInput({
        startDate: null,
        endDate: new Date("2099-01-02T00:00:00.000Z"),
        numNights: 1,
        numGuests: 2,
        maxCapacity: 4,
      })
    ).toThrow("Booking dates are required");
  });

  it("rejects missing end dates", () => {
    expect(() =>
      validateBookingInput({
        startDate: new Date("2099-01-02T00:00:00.000Z"),
        endDate: null,
        numNights: 1,
        numGuests: 2,
        maxCapacity: 4,
      })
    ).toThrow("Booking dates are required");
  });

  it("rejects end dates that are before the start date", () => {
    expect(() =>
      validateBookingInput({
        startDate: new Date("2099-01-05T00:00:00.000Z"),
        endDate: new Date("2099-01-03T00:00:00.000Z"),
        numNights: 2,
        numGuests: 2,
        maxCapacity: 4,
      })
    ).toThrow("End date must be after start date");
  });

  it("rejects same-day booking dates", () => {
    expect(() =>
      validateBookingInput({
        startDate: new Date("2099-01-02T00:00:00.000Z"),
        endDate: new Date("2099-01-02T00:00:00.000Z"),
        numNights: 1,
        numGuests: 2,
        maxCapacity: 4,
      })
    ).toThrow("End date must be after start date");
  });

  it("rejects bookings in the past", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-10T12:00:00.000Z"));

    expect(() =>
      validateBookingInput({
        startDate: new Date("2025-01-09T00:00:00.000Z"),
        endDate: new Date("2025-01-11T00:00:00.000Z"),
        numNights: 2,
        numGuests: 2,
        maxCapacity: 4,
      })
    ).toThrow("Booking date cannot be in the past");

    vi.useRealTimers();
  });

  it("rejects non-positive night counts", () => {
    expect(() =>
      validateBookingInput({
        startDate: new Date("2099-01-02T00:00:00.000Z"),
        endDate: new Date("2099-01-03T00:00:00.000Z"),
        numNights: 0,
        numGuests: 2,
        maxCapacity: 4,
      })
    ).toThrow("Booking must be at least 1 night");
  });

  it("rejects mismatched night counts", () => {
    expect(() =>
      validateBookingInput({
        startDate: new Date("2099-01-02T00:00:00.000Z"),
        endDate: new Date("2099-01-05T00:00:00.000Z"),
        numNights: 2,
        numGuests: 2,
        maxCapacity: 4,
      })
    ).toThrow("Number of nights does not match date range");
  });

  it("rejects invalid guest counts", () => {
    expect(() =>
      validateBookingInput({
        startDate: new Date("2099-01-02T00:00:00.000Z"),
        endDate: new Date("2099-01-03T00:00:00.000Z"),
        numNights: 1,
        numGuests: 0,
        maxCapacity: 4,
      })
    ).toThrow("Number of guests must be at least 1");
  });

  it("rejects guests over cabin capacity", () => {
    expect(() =>
      validateBookingInput({
        startDate: new Date("2099-01-02T00:00:00.000Z"),
        endDate: new Date("2099-01-03T00:00:00.000Z"),
        numNights: 1,
        numGuests: 5,
        maxCapacity: 4,
      })
    ).toThrow("Number of guests exceeds cabin capacity");
  });

  it("rejects negative discounts when pricing is provided", () => {
    expect(() =>
      validateBookingInput({
        startDate: new Date("2099-01-02T00:00:00.000Z"),
        endDate: new Date("2099-01-05T00:00:00.000Z"),
        numNights: 3,
        numGuests: 2,
        maxCapacity: 4,
        regularPrice: 200,
        discount: -10,
      })
    ).toThrow("Discount must be a non-negative number");
  });

  it("rejects discounts greater than the regular price", () => {
    expect(() =>
      validateBookingInput({
        startDate: new Date("2099-01-02T00:00:00.000Z"),
        endDate: new Date("2099-01-05T00:00:00.000Z"),
        numNights: 3,
        numGuests: 2,
        maxCapacity: 4,
        regularPrice: 100,
        discount: 150,
      })
    ).toThrow("Discount cannot exceed regular price");
  });

  it("accepts valid booking input", () => {
    expect(() =>
      validateBookingInput({
        startDate: new Date("2099-01-02T00:00:00.000Z"),
        endDate: new Date("2099-01-05T00:00:00.000Z"),
        numNights: 3,
        numGuests: 2,
        maxCapacity: 4,
      })
    ).not.toThrow();
  });

  it("accepts bookings without a max capacity", () => {
    expect(() =>
      validateBookingInput({
        startDate: new Date("2099-01-02T00:00:00.000Z"),
        endDate: new Date("2099-01-05T00:00:00.000Z"),
        numNights: 3,
        numGuests: 2,
        maxCapacity: undefined,
      })
    ).not.toThrow();
  });
});
