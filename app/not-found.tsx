import Link from "next/link";

/**
 * Renders a simple "not found" page with a message and a link back to the homepage.
 *
 * @returns A JSX element containing a centered heading and a "Go back home" link
 */
function NotFound() {
	return (
		<main className="mt-4 space-y-6 text-center">
			<h1 className="text-3xl font-semibold">
				This page could not be found :(
			</h1>
			<Link
				href="/"
				className="inline-block bg-accent-500 px-6 py-3 text-lg text-primary-800"
			>
				Go back home
			</Link>
		</main>
	);
}

export default NotFound;