"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

function Filter() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();

	const activeFilter = searchParams.get("capacity") ?? "all";

	function handleFilter(filter) {
		const params = new URLSearchParams(searchParams);
		params.set("capacity", filter);
		router.replace(`${pathname}?${params.toString()}`, { scroll: false });
	}

	return (
		<div className="flex w-full flex-col gap-2 rounded-2xl border border-primary-800 bg-primary-950/40 p-2 mb-2 sm:w-auto sm:flex-row sm:gap-0 sm:overflow-hidden sm:rounded-full sm:bg-transparent sm:p-0 sm:[&_button:not(:first-child)]:border-l sm:[&_button:not(:first-child)]:border-primary-800">
			<Button
				filter="all"
				handleFilter={handleFilter}
				activeFilter={activeFilter}
			>
				All cabins
			</Button>
			<Button
				filter="small"
				handleFilter={handleFilter}
				activeFilter={activeFilter}
			>
				2&mdash;3 guests
			</Button>
			<Button
				filter="medium"
				handleFilter={handleFilter}
				activeFilter={activeFilter}
			>
				4&mdash;7 guests
			</Button>
			<Button
				filter="large"
				handleFilter={handleFilter}
				activeFilter={activeFilter}
			>
				8&mdash;12 guests
			</Button>
		</div>
	);
}

function Button({ filter, handleFilter, activeFilter, children }) {
	return (
		<button
			className={`w-full rounded-xl px-4 py-2 text-center text-sm font-medium transition-colors duration-150 hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500 sm:w-auto sm:rounded-none sm:px-5 sm:text-base ${
				filter === activeFilter ? "bg-primary-700 text-primary-50" : "text-primary-200"
			}`}
			onClick={() => handleFilter(filter)}
		>
			{children}
		</button>
	);
}

export default Filter;
