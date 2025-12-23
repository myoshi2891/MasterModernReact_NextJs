// import { unstable_noStore as noStore } from "next/cache";
import CabinCard from "@/app/_components/CabinCard";
import { getCabins } from "../_lib/data-service";

/**
 * Render a responsive grid of CabinCard components filtered by cabin size.
 *
 * If process.env.SKIP_SSG === "true", the component returns `null` without fetching data.
 * Also returns `null` when no cabins are available.
 *
 * @param {{filter: 'all'|'small'|'medium'|'large'}} props - Component props.
 * @param {'all'|'small'|'medium'|'large'} props.filter - Filter to select cabins:
 *   - "all": include every cabin
 *   - "small": maxCapacity <= 3
 *   - "medium": maxCapacity between 4 and 7 inclusive
 *   - "large": maxCapacity >= 8
 * @returns {JSX.Element|null} A div containing the filtered CabinCard elements, or `null`.
 */
async function CabinList({ filter }) {
	// noStore();
	if (process.env.SKIP_SSG === "true") {
		return null;
	}
	const cabins = await getCabins();

	if (!cabins.length) return null;

	let displayedCabins;
	if (filter === "all") displayedCabins = cabins;
	if (filter === "small")
		displayedCabins = cabins.filter((cabin) => cabin.maxCapacity <= 3);
	if (filter === "medium")
		displayedCabins = cabins.filter(
			(cabin) => cabin.maxCapacity >= 4 && cabin.maxCapacity <= 7
		);
	if (filter === "large")
		displayedCabins = cabins.filter((cabin) => cabin.maxCapacity >= 8);

	return (
		<div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:gap-12 xl:grid-cols-3">
			{displayedCabins.map((cabin) => (
				<CabinCard cabin={cabin} key={cabin.id} />
			))}
		</div>
	);
}

export default CabinList;