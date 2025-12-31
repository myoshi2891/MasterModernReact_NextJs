import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Session } from "next-auth";
import type { BookingWithCabin } from "@/app/_lib/data-service";

const { authMock, getBookingsMock } = vi.hoisted(() => ({
  authMock: vi.fn<() => Promise<Session | null>>(),
  getBookingsMock: vi.fn<() => Promise<BookingWithCabin[]>>(),
}));

vi.mock("../../app/_lib/auth", () => ({
  auth: authMock,
}));

vi.mock("../../app/_lib/data-service", () => ({
  getBookings: getBookingsMock,
}));

vi.mock("../../app/_components/ReservationList", () => ({
  default: () => <div>Reservation list</div>,
}));

describe("Reservations page", () => {
  it("shows an empty-state message when there are no bookings", async () => {
    authMock.mockResolvedValue({ user: { guestId: 123 } } as Session);
    getBookingsMock.mockResolvedValue([]);

    const { default: ReservationsPage } = await import(
      "../../app/account/reservations/page"
    );
    const ui = await ReservationsPage();
    render(ui);

    expect(
      screen.getByText(/you have no reservations yet/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /luxury cabins/i })
    ).toHaveAttribute("href", "/cabins");
  });

  it("renders the reservation list when bookings exist", async () => {
    authMock.mockResolvedValue({ user: { guestId: 123 } } as Session);
    getBookingsMock.mockResolvedValue([{ id: 1 } as BookingWithCabin]);

    const { default: ReservationsPage } = await import(
      "../../app/account/reservations/page"
    );
    const ui = await ReservationsPage();
    render(ui);

    expect(screen.getByText(/reservation list/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/you have no reservations yet/i)
    ).not.toBeInTheDocument();
  });
});
