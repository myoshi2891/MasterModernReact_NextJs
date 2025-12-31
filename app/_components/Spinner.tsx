/**
 * Renders a visual loading spinner element.
 *
 * @returns A React element containing a single `div` with className `"spinner"`.
 */
function Spinner() {
	return (
		<div
			className="spinner"
			role="status"
			aria-live="polite"
			aria-label="Loading"
		/>
	);
}

export default Spinner;