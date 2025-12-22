import { describe, it, expect, vi, beforeEach } from "vitest";

const { getCabinMock, getBookedDatesMock } = vi.hoisted(() => ({
  getCabinMock: vi.fn(),
  getBookedDatesMock: vi.fn(),
}));

vi.mock("../../app/_lib/data-service", () => ({
  getCabin: getCabinMock,
  getBookedDatesByCabinId: getBookedDatesMock,
}));

describe("GET /api/cabins/[cabinId]", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("returns cabin details and booked dates", async () => {
    const date = new Date("2025-01-01T00:00:00.000Z");
    getCabinMock.mockResolvedValue({ id: 1, name: "Test Cabin" });
    getBookedDatesMock.mockResolvedValue([date]);

    const { GET } = await import("../../app/api/cabins/[cabinId]/route.js");
    const response = await GET(new Request("http://localhost/api/cabins/1"), {
      params: { cabinId: "1" },
    });

    const body = await response.json();

    expect(getCabinMock).toHaveBeenCalledWith("1");
    expect(getBookedDatesMock).toHaveBeenCalledWith("1");
    expect(body).toEqual({
      cabin: { id: 1, name: "Test Cabin" },
      bookedDates: [date.toISOString()],
    });
  });

  it("returns a fallback message when lookup fails", async () => {
    getCabinMock.mockRejectedValue(new Error("boom"));
    getBookedDatesMock.mockResolvedValue([]);

    const { GET } = await import("../../app/api/cabins/[cabinId]/route.js");
    const response = await GET(new Request("http://localhost/api/cabins/1"), {
      params: { cabinId: "1" },
    });

    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ message: "Cabin not found..." });
  });
});
