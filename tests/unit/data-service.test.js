import { describe, it, expect, vi, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../msw/server";

const { supabaseBrowserMock, supabaseServerMock, notFoundMock } = vi.hoisted(
  () => ({
    supabaseBrowserMock: { from: vi.fn() },
    supabaseServerMock: { from: vi.fn() },
    notFoundMock: vi.fn(() => {
      throw new Error("NEXT_NOT_FOUND");
    }),
  })
);

vi.mock("../../app/_lib/supabaseBrowser", () => ({
  supabaseBrowser: supabaseBrowserMock,
}));

vi.mock("../../app/_lib/supabaseServer", () => ({
  supabaseServer: supabaseServerMock,
}));

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
}));

describe("data-service", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("returns cabins ordered by name", async () => {
    const cabins = [{ id: 1, name: "A" }];
    const order = vi.fn().mockResolvedValue({ data: cabins, error: null });
    const select = vi.fn().mockReturnValue({ order });
    supabaseBrowserMock.from.mockReturnValue({ select });

    const { getCabins } = await import("../../app/_lib/data-service");
    const result = await getCabins();

    expect(supabaseBrowserMock.from).toHaveBeenCalledWith("cabins");
    expect(select).toHaveBeenCalledWith(
      "id, name, maxCapacity, regularPrice, discount, image"
    );
    expect(order).toHaveBeenCalledWith("name");
    expect(result).toEqual(cabins);
  });

  it("throws when cabins query fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const order = vi
      .fn()
      .mockResolvedValue({ data: null, error: new Error("fail") });
    const select = vi.fn().mockReturnValue({ order });
    supabaseBrowserMock.from.mockReturnValue({ select });

    const { getCabins } = await import("../../app/_lib/data-service");

    await expect(getCabins()).rejects.toThrow("Cabins could not be loaded");
    consoleError.mockRestore();
  });

  it("calls notFound when a cabin lookup fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const single = vi
      .fn()
      .mockResolvedValue({ data: null, error: new Error("fail") });
    const eq = vi.fn().mockReturnValue({ single });
    const select = vi.fn().mockReturnValue({ eq });
    supabaseBrowserMock.from.mockReturnValue({ select });

    const { getCabin } = await import("../../app/_lib/data-service");

    await expect(getCabin(42)).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("returns booked dates for a cabin in UTC", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-10T12:00:00.000Z"));

    const bookings = [
      {
        startDate: "2025-01-10T00:00:00.000Z",
        endDate: "2025-01-12T00:00:00.000Z",
      },
    ];

    const or = vi.fn().mockResolvedValue({ data: bookings, error: null });
    const eq = vi.fn().mockReturnValue({ or });
    const select = vi.fn().mockReturnValue({ eq });
    supabaseBrowserMock.from.mockReturnValue({ select });

    const { getBookedDatesByCabinId } = await import(
      "../../app/_lib/data-service"
    );
    const result = await getBookedDatesByCabinId(7);

    expect(supabaseBrowserMock.from).toHaveBeenCalledWith("bookings");
    expect(select).toHaveBeenCalledWith("*");
    expect(eq).toHaveBeenCalledWith("cabinId", 7);
    expect(or).toHaveBeenCalledWith(
      "startDate.gte.2025-01-10T00:00:00.000Z,status.eq.checked-in"
    );
    expect(result).toHaveLength(3);
    expect(result[0]).toBeInstanceOf(Date);

    vi.useRealTimers();
  });

  it("maps and filters countries from the API", async () => {
    const { getCountries } = await import("../../app/_lib/data-service");
    const countries = await getCountries();

    expect(countries).toEqual([{ name: "Japan", flag: "jp.svg" }]);
  });

  it("throws when the countries API request fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    server.use(
      http.get("https://restcountries.com/v3.1/all", () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { getCountries } = await import("../../app/_lib/data-service");

    await expect(getCountries()).rejects.toThrow("Could not fetch countries");

    consoleError.mockRestore();
  });
});
