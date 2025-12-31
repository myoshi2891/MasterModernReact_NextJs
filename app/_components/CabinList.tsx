import CabinCard from "@/app/_components/CabinCard";
import { getCabins } from "../_lib/data-service";

type FilterType = "all" | "small" | "medium" | "large";

interface CabinListProps {
	filter: FilterType;
}

/**
 * Render a responsive grid of CabinCard components filtered by cabin size.
 *
 * If the environment variable `SKIP_SSG` is set to `"true"`, rendering is skipped and the component returns `null`.
 * Also returns `null` when no cabins are available.
 *
 * @param filter - Selected size filter: `"all"` (no filtering), `"small"` (maxCapacity ≤ 3), `"medium"` (maxCapacity between 4 and 7 inclusive), `"large"` (maxCapacity ≥ 8)
 * @returns A grid of `CabinCard` elements matching the selected filter, or `null` if rendering is skipped or there are no cabins
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