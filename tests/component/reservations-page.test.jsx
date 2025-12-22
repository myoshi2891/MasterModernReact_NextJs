import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const { authMock, getBookingsMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  getBookingsMock: vi.fn(),
}));

vi.mock("@/app/_lib/auth", () => ({
  auth: authMock,
}));

vi.mock("@/app/_lib/data-service", () => ({
  getBookings: getBookingsMock,
}));

vi.mock("@/app/_components/ReservationList", () => ({
  default: () => <div>Reservation list</div>,
}));

describe("Reservations page", () => {
  it("shows an empty-state message when there are no bookings", async () => {
    authMock.mockResolvedValue({ user: { guestId: 123 } });
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
});
