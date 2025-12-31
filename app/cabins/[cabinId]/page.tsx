import Cabin from "@/app/_components/Cabin";
import Reservation from "@/app/_components/Reservation";
import Spinner from "@/app/_components/Spinner";
import { getCabin, getCabins } from "@/app/_lib/data-service";
import { Suspense } from "react";
import type { Metadata } from "next";

interface PageParams {
	cabinId: string;
}

interface PageProps {
	params: Promise<PageParams>;
}

/**
 * Produce page metadata for a cabin route.
 *
 * When `SKIP_SSG` equals `"true"` the title is `"Cabin"`; otherwise the title is `"Cabin <name>"` where `<name>` is the fetched cabin name for the provided `cabinId`.
 */
export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	if (process.env.SKIP_SSG === "true") {
		return { title: "Cabin" };
	}
	const { cabinId } = await params;
	const { name } = await getCabin(cabinId);
	return { title: `Cabin ${name}` };
}

/**
 * Provides route parameters for static pre-rendering of cabin pages.
 *
 * When SKIP_SSG is set to "true", returns an empty array. Otherwise, fetches all
 * cabins and returns an array of objects each containing `cabinId` as a string.
 */
export async function generateStaticParams(): Promise<PageParams[]> {
	if (process.env.SKIP_SSG === "true") {
		return [];
	}
	const cabins = await getCabins();
	const ids = cabins.map((cabin) => ({ cabinId: String(cabin.id) }));

	return ids;
}

/**
 * Render the cabin detail page for the cabin identified by `params.cabinId`.
 *
 * @param params - A promise that resolves to the route parameters object containing `cabinId`
 * @returns The React element containing the cabin details, a reservation heading, and the reservation UI (the reservation form is rendered inside a Suspense boundary)
 */
export default async function Page({ params }: PageProps) {
	const { cabinId } = await params;
	const cabin = await getCabin(cabinId);

	return (
		<div className="mx-auto mt-6 max-w-6xl px-4 sm:mt-8 sm:px-6 lg:px-0">
			<Cabin cabin={cabin} />
			<div className="space-y-6 sm:space-y-8">
				<h2 className="text-center text-3xl font-semibold text-accent-400 sm:text-4xl md:text-5xl">
					Reserve {cabin.name} today. Pay on arrival.
				</h2>
				<Suspense fallback={<Spinner />}>
					<Reservation cabin={cabin} />
				</Suspense>
			</div>
		</div>
	);
}