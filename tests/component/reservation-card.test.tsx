import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ReservationCard from "../../app/_components/ReservationCard";
import type { BookingWithCabin } from "@/app/_lib/data-service";

vi.mock("../../app/_components/DeleteReservation", () => ({
  default: () => <button type="button">Delete</button>,
}));

const baseBooking: BookingWithCabin = {
  id: 1,
  guestId: 2,
  cabinId: 1,
  startDate: "2025-01-01T00:00:00.000Z",
  endDate: "2025-01-05T00:00:00.000Z",
  numNights: 4,
  totalPrice: 800,
  numGuests: 2,
  status: "unconfirmed",
  hasBreakfast: false,
  isPaid: false,
  cabinPrice: 800,
  extrasPrice: 0,
  observations: null,
  created_at: "2024-12-15T12:00:00.000Z",
  cabins: { name: "Pine", image: "/pine.jpg", maxCapacity: 4 },
};

describe("ReservationCard", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows past status and hides actions for past bookings", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-10T12:00:00.000Z"));

    render(<ReservationCard booking={baseBooking} onDelete={vi.fn()} />);

    expect(screen.getByText(/past/i)).toBeInTheDocument();
    expect(screen.queryByText(/upcoming/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /^edit$/i })
    ).not.toBeInTheDocument();
  });

  it("shows upcoming status and actions for future bookings", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-01T12:00:00.000Z"));

    const upcomingBooking: BookingWithCabin = {
      ...baseBooking,
      startDate: "2025-02-01T00:00:00.000Z",
      endDate: "2025-02-03T00:00:00.000Z",
    };

    render(<ReservationCard booking={upcomingBooking} onDelete={vi.fn()} />);

    expect(screen.getByText(/upcoming/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^edit$/i })).toBeInTheDocument();
    expect(screen.getByText(/delete/i)).toBeInTheDocument();
  });
});
