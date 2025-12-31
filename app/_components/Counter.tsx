"use client";

import { useState } from "react";

interface CounterProps {
	users: unknown[];
}

/**
 * Renders a simple counter and displays the total number of users.
 *
 * @param users - Array of users whose length is shown in the paragraph
 * @returns A React element containing the user count and a button that increments an internal counter when clicked
 */
export default function Counter({ users }: CounterProps) {
	const [count, setCount] = useState(0);

	return (
		<div>
			<p>There are {users.length} users</p>
			<button
				type="button"
				onClick={() => setCount((c) => c + 1)}
				aria-label="Increment counter"
			>
				{count}
			</button>
		</div>
	);
}