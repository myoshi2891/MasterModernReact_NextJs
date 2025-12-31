import { beforeEach, describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Session } from "next-auth";
import type { Settings, Cabin } from "@/types/domain";

const { authMock, getSettingsMock, getBookedDatesMock } = vi.hoisted(() => ({
  authMock: vi.fn<() => Promise<Session | null>>(),
  getSettingsMock: vi.fn<() => Promise<Settings>>(),
  getBookedDatesMock: vi.fn<() => Promise<Date[]>>(),
}));

vi.mock("../../app/_lib/auth", () => ({
  auth: authMock,
}));

vi.mock("../../app/_lib/data-service", () => ({
  getSettings: getSettingsMock,
  getBookedDatesByCabinId: getBookedDatesMock,
}));

vi.mock("../../app/_components/DateSelector", () => ({
  default: () => <div>Date selector</div>,
}));

vi.mock("../../app/_components/ReservationForm", () => ({
  default: () => <div>Reservation form</div>,
}));

describe("Reservation", () => {
  beforeEach(() => {
    authMock.mockReset();
    getSettingsMock.mockReset();
    getBookedDatesMock.mockReset();
    vi.resetModules();
  });

  it("shows the login message when the user is not authenticated", async () => {
    authMock.mockResolvedValue(null);
    getSettingsMock.mockResolvedValue({
      id: 1,
      created_at: "2024-01-01T00:00:00.000Z",
      minBookingLength: 2,
      maxBookingLength: 10,
      maxGuestsPerBooking: 8,
      breakfastPrice: 15,
    });
    getBookedDatesMock.mockResolvedValue([]);

    const { default: Reservation } = await import(
      "../../app/_components/Reservation"
    );
    const ui = await Reservation({ cabin: { id: 1 } as Cabin });
    render(ui);

    expect(screen.getByText(/please/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
  });

  it("shows the reservation form when a user is present", async () => {
    authMock.mockResolvedValue({ user: { id: "user" }, expires: "" } as Session);
    getSettingsMock.mockResolvedValue({
      id: 1,
      created_at: "2024-01-01T00:00:00.000Z",
      minBookingLength: 2,
      maxBookingLength: 10,
      maxGuestsPerBooking: 8,
      breakfastPrice: 15,
    });
    getBookedDatesMock.mockResolvedValue([]);

    const { default: Reservation } = await import(
      "../../app/_components/Reservation"
    );
    const ui = await Reservation({ cabin: { id: 1 } as Cabin });
    render(ui);

    expect(screen.getByText(/reservation form/i)).toBeInTheDocument();
    expect(screen.queryByText(/please/i)).not.toBeInTheDocument();
  });
});
