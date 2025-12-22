import { getBookedDatesByCabinId, getCabin } from "@/app/_lib/data-service";

export async function GET(request, { params }) {
	const { cabinId } = params;

	try {
		const [cabin, bookedDates] = await Promise.all([
			getCabin(cabinId),
			getBookedDatesByCabinId(cabinId),
		]);
		return Response.json({ cabin, bookedDates });
	} catch (error) {
		const message = error?.message ?? "";
		const isNotFound =
			error?.digest === "NEXT_NOT_FOUND" ||
			message === "NEXT_NOT_FOUND" ||
			message.toLowerCase().includes("not found");

		if (isNotFound) {
			return Response.json({ message: "Cabin not found..." }, { status: 404 });
		}

		console.error("Error fetching cabin:", error);
		return Response.json(
			{ message: "Internal Server Error" },
			{ status: 500 }
		);
	}
}

// export async function POST(){}
