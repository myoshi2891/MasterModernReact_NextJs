"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

interface SubmitButtonProps {
	children: ReactNode;
	pendingLabel: string;
	className?: string;
}

/**
 * Button component that disables itself and displays a pending label while the surrounding form is submitting.
 *
 * @param children - Content rendered inside the button when the form is not submitting
 * @param pendingLabel - Text to display inside the button while the form is submitting
 * @param className - Additional CSS classes to append to the button's default class list
 * @returns A button element that is disabled while the form is pending and shows `pendingLabel`; otherwise shows `children`
 */
export default function SubmitButton({
	children,
	pendingLabel,
	className = "",
}: SubmitButtonProps) {
	const { pending } = useFormStatus();

	return (
		<button
			disabled={pending}
			className={`bg-accent-500 px-8 py-4 font-semibold text-primary-800 transition-all hover:bg-accent-600 disabled:cursor-not-allowed disabled:bg-gray-500 disabled:text-gray-300 ${className}`}
		>
			{pending ? pendingLabel : children}
		</button>
	);
}