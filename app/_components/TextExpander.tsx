"use client";

import { useState } from "react";

interface TextExpanderProps {
	children: string;
}

/**
 * Displays text truncated to the first 40 words with an inline toggle to reveal or hide the full text.
 *
 * @param children - The text to display; when longer than 40 words it is truncated to the first 40 words followed by "..."
 * @returns A span element containing the displayed (possibly truncated) text and a button that toggles between truncated and full text
 */
function TextExpander({ children }: TextExpanderProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const displayText = isExpanded
		? children
		: children.split(" ").slice(0, 40).join(" ") + "...";

	return (
		<span>
			{displayText}{" "}
			<button
				className="border-b border-primary-700 pb-1 leading-3 text-primary-700"
				onClick={() => setIsExpanded(!isExpanded)}
			>
				{isExpanded ? "Show less" : "Show more"}
			</button>
		</span>
	);
}

export default TextExpander;