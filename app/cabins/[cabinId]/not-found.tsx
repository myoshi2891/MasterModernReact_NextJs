import Link from "next/link";

/**
 * Renders a "cabin not found" page with a message and a link to the cabins list.
 *
 * @returns A JSX element containing a heading that the cabin could not be found and a link to "/cabins".
 */
function NotFound() {
	return (
		<main className="mt-4 space-y-6 text-center">
			<h1 className="text-3xl font-semibold">
				This cabin could not be found :(
			</h1>
			<Link
				href="/cabins"
				className="inline-block bg-accent-500 px-6 py-3 text-lg text-primary-800"
			>
				Go to all cabins
			</Link>
		</main>
	);
}

export default NotFound;