import { UsersIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";

function CabinCard({ cabin }) {
	const { id, name, maxCapacity, regularPrice, discount, image } = cabin;

	return (
		<div className="flex flex-col overflow-hidden border border-primary-800 sm:flex-row">
			<div className="relative h-56 w-full sm:h-auto sm:w-1/2 sm:min-h-full">
				<Image
					src={image}
					fill
					alt={`Cabin ${name}`}
					className="object-cover sm:border-r sm:border-primary-800"
					sizes="(min-width: 1280px) 340px, (min-width: 640px) 50vw, 100vw"
				/>
			</div>

			<div className="flex flex-1 flex-col bg-primary-950">
				<div className="px-6 py-5 sm:px-7 sm:py-6">
					<h3 className="text-2xl font-semibold text-accent-500 sm:text-3xl">
						Cabin {name}
					</h3>

					<div className="mt-4 flex flex-col gap-4 text-primary-200 sm:mt-5 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex items-center gap-3">
							<UsersIcon className="h-5 w-5 text-primary-600" />
							<p className="text-sm sm:text-base">
								For up to <span className="font-semibold">{maxCapacity}</span> guests
							</p>
						</div>

						<div className="flex flex-wrap items-baseline justify-end gap-3 text-primary-100">
							{discount > 0 ? (
								<>
									<span className="text-3xl font-[350] sm:text-[2.15rem]">
										${regularPrice - discount}
									</span>
									<span className="text-sm font-semibold text-primary-600 line-through">
										${regularPrice}
									</span>
								</>
							) : (
								<span className="text-3xl font-[350] sm:text-[2.15rem]">
									${regularPrice}
								</span>
							)}
							<span className="text-sm text-primary-300">/ night</span>
						</div>
					</div>
				</div>

				<div className="border-t border-primary-800 text-center sm:text-right">
					<Link
						href={`/cabins/${id}`}
						className="block px-6 py-4 font-semibold transition-colors duration-150 hover:bg-accent-600 hover:text-primary-900 sm:inline-block sm:border-l sm:border-primary-800 sm:px-6"
					>
						Details & reservation &rarr;
					</Link>
				</div>
			</div>
		</div>
	);
}

export default CabinCard;
