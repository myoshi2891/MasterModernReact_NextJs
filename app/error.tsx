"use client";

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

/**
 * Render a centered error UI that displays the provided error message and a "Try again" button.
 *
 * @param error - The Error object whose `message` is shown to the user (may include `digest` in Next.js 15)
 * @param reset - Callback invoked when the user clicks the "Try again" button to retry or reset state
 * @returns A JSX element containing the error message and a retry button
 */
export default function Error({ error, reset }: ErrorProps) {
	return (
		<main className="flex flex-col items-center justify-center gap-6">
			<h1 className="text-3xl font-semibold">Something went wrong!</h1>
			<p className="text-lg">{error.message}</p>

			<button
				type="button"
				className="inline-block bg-accent-500 px-6 py-3 text-lg text-primary-800"
				onClick={reset}
			>
				Try again
			</button>
		</main>
	);
}