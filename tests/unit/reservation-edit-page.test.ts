import { isValidElement } from "react";
import type { Session } from "next-auth";
import type { BookingWithCabin } from "@/app/_lib/data-service";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { authMock, getBookingMock, notFoundMock, updateBookingMock } = vi.hoisted(
	() => ({
		authMock: vi.fn<() => Promise<Session | null>>(),
		getBookingMock: vi.fn<
			(bookingId: number | string) => Promise<BookingWithCabin>
		>(),
		notFoundMock: vi.fn(() => {
			throw new Error("NEXT_NOT_FOUND");
		}),
		updateBookingMock: vi.fn(),
	}),
);

vi.mock("../../app/_lib/auth", () => ({
	auth: authMock,
}));

vi.mock("../../app/_lib/data-service", () => ({
	getBooking: getBookingMock,
}));

vi.mock("../../app/_lib/actions", () => ({
	updateBooking: updateBookingMock,
}));

vi.mock("next/navigation", () => ({
	notFound: notFoundMock,
}));

const booking: BookingWithCabin = {
	id: 7,
	created_at: "2099-02-01T00:00:00.000Z",
	startDate: "2099-02-10T00:00:00.000Z",
	endDate: "2099-02-12T00:00:00.000Z",
	numNights: 2,
	numGuests: 2,
	cabinPrice: 300,
	extrasPrice: 0,
	totalPrice: 600,
	status: "unconfirmed",
	hasBreakfast: false,
	isPaid: false,
	observations: "Late check-in.",
	cabinId: 3,
	guestId: 42,
	cabins: {
		name: "Cozy Cabin",
		maxCapacity: 4,
		image: "/cabin.jpg",
	},
};

async function renderPage() {
	const { default: Page } = await import(
		"../../app/account/reservations/edit/[bookingId]/page"
	);

	return Page({ params: Promise.resolve({ bookingId: "7" }) });
}

describe("reservation edit page", () => {
	beforeEach(() => {
		vi.resetModules();
		notFoundMock.mockImplementation(() => {
			throw new Error("NEXT_NOT_FOUND");
		});
		authMock.mockResolvedValue({
			user: { guestId: booking.guestId },
			expires: "2099-12-31T23:59:59.999Z",
		});
		getBookingMock.mockResolvedValue(booking);
	});

	it("returns not found when the booking belongs to another guest", async () => {
		getBookingMock.mockResolvedValue({ ...booking, guestId: 99 });

		await expect(renderPage()).rejects.toThrow("NEXT_NOT_FOUND");

		expect(getBookingMock).toHaveBeenCalledWith("7");
		expect(notFoundMock).toHaveBeenCalledOnce();
	});

	it("returns not found without loading the booking when the session is missing", async () => {
		authMock.mockResolvedValue(null);

		await expect(renderPage()).rejects.toThrow("NEXT_NOT_FOUND");

		expect(getBookingMock).not.toHaveBeenCalled();
		expect(notFoundMock).toHaveBeenCalledOnce();
	});

	it("returns not found without loading the booking when guestId is missing", async () => {
		authMock.mockResolvedValue({
			user: {},
			expires: "2099-12-31T23:59:59.999Z",
		});

		await expect(renderPage()).rejects.toThrow("NEXT_NOT_FOUND");

		expect(getBookingMock).not.toHaveBeenCalled();
		expect(notFoundMock).toHaveBeenCalledOnce();
	});

	it("returns the page for the booking owner", async () => {
		const result = await renderPage();

		expect(isValidElement(result)).toBe(true);
		expect(getBookingMock).toHaveBeenCalledWith("7");
		expect(notFoundMock).not.toHaveBeenCalled();
	});
});
