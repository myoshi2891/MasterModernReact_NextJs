import { Suspense } from "react";
import type { Metadata } from "next";
import CabinList from "../_components/CabinList";
import Spinner from "../_components/Spinner";
import Filter from "../_components/Filter";
import ReservationReminder from "../_components/ReservationReminder";

export const revalidate = 3600;

export const metadata: Metadata = {
	title: "Cabins",
};

type FilterType = "all" | "small" | "medium" | "large";

interface PageProps {
	searchParams: Promise<{ capacity?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
	const params = await searchParams;
	const filter = (params?.capacity ?? "all") as FilterType;

	return (
		<div className="mx-auto mt-6 max-w-6xl px-4 sm:mt-8 sm:px-6 lg:px-0">
			<header className="space-y-4 sm:space-y-5">
				<h1 className="text-3xl font-medium text-accent-400 sm:text-4xl md:text-5xl">
					Our Luxury Cabins
				</h1>
				<p className="text-base leading-relaxed text-primary-200 sm:text-lg sm:leading-relaxed md:max-w-3xl">
					Cozy yet luxurious cabins, located right in the heart of the Italian
					Dolomites. Imagine waking up to beautiful mountain views, spending
					your days exploring the dark forests around, or just relaxing in your
					private hot tub under the stars. Enjoy nature&apos;s beauty in your
					own little home away from home. The perfect spot for a peaceful, calm
					vacation. Welcome to paradise.
				</p>
			</header>
			<div className="mt-8 flex flex-col gap-4 sm:mt-10 sm:flex-row sm:items-center sm:justify-end">
				<Filter />
			</div>
			<Suspense fallback={<Spinner />} key={filter}>
				<CabinList filter={filter} />
				<ReservationReminder />
			</Suspense>
		</div>
	);
}