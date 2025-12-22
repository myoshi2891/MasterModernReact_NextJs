import { describe, it, expect, beforeEach, vi } from "vitest";

const {
  authMock,
  getBookingsMock,
  supabaseFromMock,
  insertMock,
  updateMock,
  updateEqMock,
  deleteMock,
  deleteEqMock,
  revalidatePathMock,
  redirectMock,
} = vi.hoisted(() => {
  const insertMock = vi.fn().mockResolvedValue({ error: null });
  const updateEqMock = vi.fn().mockResolvedValue({ error: null });
  const updateMock = vi.fn(() => ({ eq: updateEqMock }));
  const deleteEqMock = vi.fn().mockResolvedValue({ error: null });
  const deleteMock = vi.fn(() => ({ eq: deleteEqMock }));
  const supabaseFromMock = vi.fn(() => ({
    insert: insertMock,
    update: updateMock,
    delete: deleteMock,
  }));

  return {
    authMock: vi.fn(),
    getBookingsMock: vi.fn(),
    supabaseFromMock,
    insertMock,
    updateMock,
    updateEqMock,
    deleteMock,
    deleteEqMock,
    revalidatePathMock: vi.fn(),
    redirectMock: vi.fn(),
  };
});

vi.mock("../../app/_lib/auth", () => ({
  auth: authMock,
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("../../app/_lib/data-service", () => ({
  getBookings: getBookingsMock,
}));

vi.mock("../../app/_lib/supabaseServer", () => ({
  supabaseServer: { from: supabaseFromMock },
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

const baseBookingData = {
  startDate: new Date("2025-02-10T00:00:00.000Z"),
  endDate: new Date("2025-02-12T00:00:00.000Z"),
  numNights: 2,
  cabinPrice: 300,
  cabinId: 7,
  maxCapacity: 4,
};

const makeFormData = (values) => ({
  get: (key) => values[key],
});

const makeCreateFormData = (overrides = {}) =>
  makeFormData({
    numGuests: "2",
    observations: "No peanuts please.",
    ...overrides,
  });

const makeUpdateFormData = (overrides = {}) =>
  makeFormData({
    bookingId: "1",
    numGuests: "2",
    observations: "Late check-in.",
    ...overrides,
  });

describe("booking actions", () => {
  beforeEach(() => {
    vi.resetModules();
    authMock.mockResolvedValue({ user: { guestId: 1 } });
    getBookingsMock.mockResolvedValue([
      { id: 1, cabins: { maxCapacity: 4 } },
    ]);
    insertMock.mockResolvedValue({ error: null });
    updateEqMock.mockResolvedValue({ error: null });
    deleteEqMock.mockResolvedValue({ error: null });
    updateMock.mockReturnValue({ eq: updateEqMock });
    deleteMock.mockReturnValue({ eq: deleteEqMock });
    supabaseFromMock.mockReturnValue({
      insert: insertMock,
      update: updateMock,
      delete: deleteMock,
    });
  });

  it("rejects createBooking when not logged in", async () => {
    authMock.mockResolvedValue(null);

    const { createBooking } = await import("../../app/_lib/actions");

    await expect(
      createBooking(baseBookingData, makeCreateFormData())
    ).rejects.toThrow("You must be logged in");

    expect(supabaseFromMock).not.toHaveBeenCalled();
  });

  it("rejects createBooking when guestId is missing", async () => {
    authMock.mockResolvedValue({ user: { guestId: null } });

    const { createBooking } = await import("../../app/_lib/actions");

    await expect(
      createBooking(baseBookingData, makeCreateFormData())
    ).rejects.toThrow("You must be logged in");

    expect(supabaseFromMock).not.toHaveBeenCalled();
  });

  it("rejects createBooking when guest count exceeds capacity", async () => {
    const bookingData = { ...baseBookingData, maxCapacity: 2 };

    const { createBooking } = await import("../../app/_lib/actions");

    await expect(
      createBooking(bookingData, makeCreateFormData({ numGuests: "3" }))
    ).rejects.toThrow("Number of guests exceeds cabin capacity");

    expect(supabaseFromMock).not.toHaveBeenCalled();
  });

  it("rejects createBooking when night count is invalid", async () => {
    const bookingData = {
      ...baseBookingData,
      numNights: 0,
      endDate: baseBookingData.startDate,
    };

    const { createBooking } = await import("../../app/_lib/actions");

    await expect(
      createBooking(bookingData, makeCreateFormData())
    ).rejects.toThrow("Booking must be at least 1 night");

    expect(supabaseFromMock).not.toHaveBeenCalled();
  });

  it("creates a booking and redirects for valid input", async () => {
    const { createBooking } = await import("../../app/_lib/actions");

    await createBooking(baseBookingData, makeCreateFormData());

    expect(supabaseFromMock).toHaveBeenCalledWith("bookings");
    expect(insertMock).toHaveBeenCalledTimes(1);
    expect(insertMock.mock.calls[0][0][0]).toMatchObject({
      cabinId: 7,
      guestId: 1,
      numGuests: 2,
      numNights: 2,
      totalPrice: 300,
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/account/reservations");
    expect(revalidatePathMock).toHaveBeenCalledWith("/cabins/7");
    expect(redirectMock).toHaveBeenCalledWith("/cabins/thankyou");
  });

  it("allows duplicate booking submissions (risk)", async () => {
    const { createBooking } = await import("../../app/_lib/actions");

    await createBooking(baseBookingData, makeCreateFormData());
    await createBooking(baseBookingData, makeCreateFormData());

    expect(insertMock).toHaveBeenCalledTimes(2);
  });

  it("rejects updateBooking when not logged in", async () => {
    authMock.mockResolvedValue(null);

    const { updateBooking } = await import("../../app/_lib/actions");

    await expect(updateBooking(makeUpdateFormData())).rejects.toThrow(
      "You must be logged in"
    );

    expect(getBookingsMock).not.toHaveBeenCalled();
  });

  it("rejects updateBooking when guestId is missing", async () => {
    authMock.mockResolvedValue({ user: { guestId: null } });

    const { updateBooking } = await import("../../app/_lib/actions");

    await expect(updateBooking(makeUpdateFormData())).rejects.toThrow(
      "You must be logged in"
    );

    expect(getBookingsMock).not.toHaveBeenCalled();
  });

  it("rejects updateBooking when the booking is not owned", async () => {
    const { updateBooking } = await import("../../app/_lib/actions");

    await expect(
      updateBooking(makeUpdateFormData({ bookingId: "2" }))
    ).rejects.toThrow("You are not allowed to update this booking.");

    expect(updateMock).not.toHaveBeenCalled();
  });

  it("rejects updateBooking when guest count is invalid", async () => {
    const { updateBooking } = await import("../../app/_lib/actions");

    await expect(
      updateBooking(makeUpdateFormData({ numGuests: "0" }))
    ).rejects.toThrow("Number of guests must be at least 1");

    expect(getBookingsMock).not.toHaveBeenCalled();
  });

  it("rejects updateBooking when guest count exceeds capacity", async () => {
    getBookingsMock.mockResolvedValue([
      { id: 1, cabins: { maxCapacity: 2 } },
    ]);

    const { updateBooking } = await import("../../app/_lib/actions");

    await expect(
      updateBooking(makeUpdateFormData({ numGuests: "3" }))
    ).rejects.toThrow("Number of guests exceeds cabin capacity");

    expect(updateMock).not.toHaveBeenCalled();
  });

  it("updates a booking without logging form data", async () => {
    const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
    const { updateBooking } = await import("../../app/_lib/actions");

    await updateBooking(makeUpdateFormData({ numGuests: "3" }));

    expect(supabaseFromMock).toHaveBeenCalledWith("bookings");
    expect(updateMock).toHaveBeenCalledWith({
      numGuests: 3,
      observations: "Late check-in.".slice(0, 1000),
    });
    expect(updateEqMock).toHaveBeenCalledWith("id", 1);
    expect(revalidatePathMock).toHaveBeenCalledWith(
      "/account/reservations/edit/1"
    );
    expect(redirectMock).toHaveBeenCalledWith("/account/reservations");
    expect(consoleLog).not.toHaveBeenCalled();

    consoleLog.mockRestore();
  });

  it("rejects deleteBooking when not logged in", async () => {
    authMock.mockResolvedValue(null);

    const { deleteBooking } = await import("../../app/_lib/actions");

    await expect(deleteBooking(1)).rejects.toThrow("You must be logged in");

    expect(getBookingsMock).not.toHaveBeenCalled();
  });

  it("rejects deleteBooking when the booking is not owned", async () => {
    const { deleteBooking } = await import("../../app/_lib/actions");

    await expect(deleteBooking(2)).rejects.toThrow(
      "You are not allowed to delete this booking."
    );

    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("deletes a booking for the owner", async () => {
    const { deleteBooking } = await import("../../app/_lib/actions");

    await deleteBooking(1);

    expect(supabaseFromMock).toHaveBeenCalledWith("bookings");
    expect(deleteMock).toHaveBeenCalledTimes(1);
    expect(deleteEqMock).toHaveBeenCalledWith("id", 1);
    expect(revalidatePathMock).toHaveBeenCalledWith("/account/reservations");
  });
});
