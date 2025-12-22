import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const { reservationState, createBookingMock } = vi.hoisted(() => ({
  reservationState: {
    range: { from: undefined, to: undefined },
    resetRange: vi.fn(),
    setRange: vi.fn(),
  },
  createBookingMock: vi.fn(),
}));

vi.mock("../../app/_components/ReservationContext", () => ({
  useReservation: () => reservationState,
}));

vi.mock("../../app/_lib/actions", () => ({
  createBooking: createBookingMock,
}));

vi.mock("../../app/_components/SubmitButton", () => ({
  default: ({ children, pendingLabel, ...props }) => (
    <button {...props}>{children}</button>
  ),
}));

const baseCabin = {
  id: 1,
  name: "Sequoia",
  maxCapacity: 3,
  regularPrice: 200,
  discount: 20,
};

const baseUser = {
  name: "Test User",
  image: "/avatar.png",
};

async function renderForm() {
  const { default: ReservationForm } = await import(
    "../../app/_components/ReservationForm"
  );
  return render(<ReservationForm cabin={baseCabin} user={baseUser} />);
}

describe("ReservationForm", () => {
  beforeEach(() => {
    reservationState.range = { from: undefined, to: undefined };
  });

  it("prompts for dates before showing the submit button", async () => {
    await renderForm();

    expect(screen.getByText(/start by selecting dates/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /reserve now/i })
    ).not.toBeInTheDocument();
  });

  it("shows the submit button once dates are selected", async () => {
    reservationState.range = {
      from: new Date("2025-01-01T00:00:00.000Z"),
      to: new Date("2025-01-04T00:00:00.000Z"),
    };

    await renderForm();

    expect(
      screen.getByRole("button", { name: /reserve now/i })
    ).toBeInTheDocument();
  });

  it("limits guest options to cabin capacity", async () => {
    reservationState.range = {
      from: new Date("2025-01-01T00:00:00.000Z"),
      to: new Date("2025-01-03T00:00:00.000Z"),
    };

    await renderForm();

    const guestsSelect = screen.getByLabelText(/how many guests\?/i);
    expect(guestsSelect).toBeRequired();

    const options = screen.getAllByRole("option");
    const values = options.map((option) => option.value);

    expect(values).toEqual(["", "1", "2", "3"]);
    expect(values).not.toContain("4");
  });
});
