"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton({ children, pendingLabel, className = "" }) {
	const { pending } = useFormStatus();

	return (
		<button
			disabled={pending}
			className={`bg-accent-500 px-8 py-4 text-primary-800 font-semibold transition-all hover:bg-accent-600 disabled:cursor-not-allowed disabled:bg-gray-500 disabled:text-gray-300 ${className}`}
		>
			{pending ? pendingLabel : children}
		</button>
	);
}
