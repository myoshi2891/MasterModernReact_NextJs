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

  it("returns a 404 when the cabin is not found", async () => {
    const notFoundError = new Error("NEXT_NOT_FOUND");
    notFoundError.digest = "NEXT_NOT_FOUND";
    getCabinMock.mockRejectedValue(notFoundError);
    getBookedDatesMock.mockResolvedValue([]);

    const { GET } = await import("../../app/api/cabins/[cabinId]/route.js");
    const response = await GET(new Request("http://localhost/api/cabins/1"), {
      params: { cabinId: "1" },
    });

    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ message: "Cabin not found..." });
  });

  it("returns a 404 when the error message is NEXT_NOT_FOUND", async () => {
    getCabinMock.mockRejectedValue(new Error("NEXT_NOT_FOUND"));
    getBookedDatesMock.mockResolvedValue([]);

    const { GET } = await import("../../app/api/cabins/[cabinId]/route.js");
    const response = await GET(new Request("http://localhost/api/cabins/1"), {
      params: { cabinId: "1" },
    });

    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ message: "Cabin not found..." });
  });

  it("returns a 500 when the lookup fails unexpectedly", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    getCabinMock.mockRejectedValue(new Error("db unavailable"));
    getBookedDatesMock.mockResolvedValue([]);

    const { GET } = await import("../../app/api/cabins/[cabinId]/route.js");
    const response = await GET(new Request("http://localhost/api/cabins/1"), {
      params: { cabinId: "1" },
    });

    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ message: "Internal Server Error" });
    consoleError.mockRestore();
  });
});
