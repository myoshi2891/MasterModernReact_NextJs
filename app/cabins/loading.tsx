import Spinner from "@/app/_components/Spinner";

/**
 * Displays a centered loading indicator and message shown while cabin data is loading.
 *
 * @returns A React element containing a centered spinner and the text "Loading cabin data..."
 */
export default function Loading() {
	return (
		<div className="grid items-center justify-center">
			<Spinner />
			<p className="text-xl text-primary-200">Loading cabin data...</p>
		</div>
	);
}