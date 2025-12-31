import CabinCard from "@/app/_components/CabinCard";
import { getCabins } from "../_lib/data-service";

type FilterType = "all" | "small" | "medium" | "large";

interface CabinListProps {
	filter: FilterType;
}

/**
 * Render a responsive grid of CabinCard components filtered by cabin size.
 *
 * If process.env.SKIP_SSG === "true", the component returns `null` without fetching data.
 * Also returns `null` when no cabins are available.
 */
async function CabinList({ filter }: CabinListProps) {
	if (process.env.SKIP_SSG === "true") {
		return null;
	}
	const cabins = await getCabins();

	if (!cabins.length) return null;

	let displayedCabins = cabins;
	if (filter === "small") {
		displayedCabins = cabins.filter((cabin) => cabin.maxCapacity <= 3);
	} else if (filter === "medium") {
		displayedCabins = cabins.filter(
			(cabin) => cabin.maxCapacity >= 4 && cabin.maxCapacity <= 7
		);
	} else if (filter === "large") {
		displayedCabins = cabins.filter((cabin) => cabin.maxCapacity >= 8);
	}

	return (
		<div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:gap-12 xl:grid-cols-3">
			{displayedCabins.map((cabin) => (
				<CabinCard cabin={cabin} key={cabin.id} />
			))}
		</div>
	);
}

export default CabinList;