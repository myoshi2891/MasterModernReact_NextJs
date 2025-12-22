import { getBookedDatesByCabinId, getCabin } from "@/app/_lib/data-service";

/**
 * Handle GET requests to retrieve a cabin and its booked dates by cabinId.
 *
 * @param {Request} request - The incoming HTTP request.
 * @param {{ params: { cabinId: string } }} context - Route context containing route parameters.
 * @param {string} context.params.cabinId - The ID of the cabin to fetch.
 * @returns {Object} On success, a JSON response with `{ cabin, bookedDates }`. If the cabin is not found, a 404 JSON response with `{ message: "Cabin not found..." }`. On other errors, a 500 JSON response with `{ message: "Internal Server Error" }`.
 */
export async function GET(request, { params }) {
	const { cabinId } = params;

	try {
		const [cabin, bookedDates] = await Promise.all([
			getCabin(cabinId),
			getBookedDatesByCabinId(cabinId),
		]);
		return Response.json({ cabin, bookedDates });
	} catch (error) {
		const message = typeof error?.message === "string" ? error.message : "";
		const isNotFound =
			error?.digest === "NEXT_NOT_FOUND" ||
			message === "NEXT_NOT_FOUND" ||
			message === "Cabin not found" ||
			message === "Cabin not found...";

		if (isNotFound) {
			return Response.json({ message: "Cabin not found..." }, { status: 404 });
		}

		if (process.env.NODE_ENV === "production") {
			console.error("Error fetching cabin:", message || "Unknown error");
		} else {
			console.error("Error fetching cabin:", error);
		}
		return Response.json(
			{ message: "Internal Server Error" },
			{ status: 500 }
		);
	}
}

// export async function POST(){}