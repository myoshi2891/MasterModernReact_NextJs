import { NextRequest } from "next/server";
import { getBookedDatesByCabinId, getCabin } from "@/app/_lib/data-service";
import type { Cabin } from "@/types/domain";

/**
 * Route context for cabin API endpoint.
 */
interface RouteContext {
	params: Promise<{ cabinId: string }>;
}

/**
 * Success response structure.
 */
interface CabinResponse {
	cabin: Cabin;
	bookedDates: Date[];
}

/**
 * Error response structure.
 */
interface ErrorResponse {
	message: string;
}

/**
 * Next.js error with digest property.
 */
interface NextError extends Error {
	digest?: string;
}

/**
 * Handle GET requests to retrieve a cabin and its booked dates by cabinId.
 *
 * @param request - The incoming HTTP request.
 * @param context - Route context containing route parameters.
 * @returns On success, a JSON response with `{ cabin, bookedDates }`. If the cabin is not found, a 404 JSON response with `{ message: "Cabin not found..." }`. On other errors, a 500 JSON response with `{ message: "Internal Server Error" }`.
 */
export async function GET(
	request: NextRequest,
	context: RouteContext
): Promise<Response> {
	const { cabinId } = await context.params;

	try {
		const [cabin, bookedDates] = await Promise.all([
			getCabin(cabinId),
			getBookedDatesByCabinId(cabinId),
		]);
		return Response.json({ cabin, bookedDates } as CabinResponse);
	} catch (error) {
		const nextError = error as NextError;
		const message =
			typeof nextError?.message === "string" ? nextError.message : "";
		const isNotFound =
			nextError?.digest === "NEXT_NOT_FOUND" || message === "NEXT_NOT_FOUND";

		if (isNotFound) {
			return Response.json(
				{ message: "Cabin not found..." } as ErrorResponse,
				{ status: 404 }
			);
		}

		if (process.env.NODE_ENV === "production") {
			console.error("Error fetching cabin:", message || "Unknown error");
		} else {
			console.error("Error fetching cabin:", error);
		}
		return Response.json(
			{ message: "Internal Server Error" } as ErrorResponse,
			{ status: 500 }
		);
	}
}