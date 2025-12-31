import type { Metadata } from "next";
import SignInButton from "../_components/SignInButton";

export const metadata: Metadata = {
	title: "Login",
};

/**
 * Renders the login page containing a centered title and a sign-in control.
 *
 * @returns The JSX for a centered header reading "Sign in to access your guest area" and a `SignInButton` component.
 */
export default function Page() {
	return (
		<div className="mt-10 flex flex-col items-center gap-10">
			<h1 className="text-3xl font-semibold">
				Sign in to access your guest area
			</h1>
			<SignInButton />
		</div>
	);
}