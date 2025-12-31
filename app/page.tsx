import Image from "next/image";
import Link from "next/link";

import bg from "@/public/bg.png";

/**
 * Render the landing page hero: full-bleed background image with centered heading and a CTA link to /cabins.
 */
export default function Page() {
	return (
		<div className="relative min-h-screen">
			<Image
				src={bg}
				fill
				quality={80}
				placeholder="blur"
				className="object-cover object-top"
				alt="Mountains and forests with two cabins"
			/>

			<div className="relative z-10 flex min-h-screen flex-col items-center justify-center text-center">
				<h1 className="mb-10 text-4xl font-normal tracking-tight text-primary-50 sm:text-6xl md:text-8xl">
					Welcome to paradise.
				</h1>
				<Link
					href="/cabins"
					className="bg-accent-500 px-8 py-6 text-lg font-semibold text-primary-800 transition-all hover:bg-accent-600"
				>
					Explore luxury cabins
				</Link>
			</div>
		</div>
	);
}