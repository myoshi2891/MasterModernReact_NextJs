// import { unstable_noStore as noStore } from "next/cache";
import CabinCard from "@/app/_components/CabinCard";
import { getCabins } from "../_lib/data-service";

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
