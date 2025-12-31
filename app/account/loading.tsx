import Spinner from "@/app/_components/Spinner";

/**
 * Provides the default loading indicator for this route by rendering the shared Spinner component.
 *
 * @returns The `Spinner` JSX element used as the loading indicator.
 */
export default function Loading() {
	return <Spinner />;
}