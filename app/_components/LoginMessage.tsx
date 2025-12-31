import Link from "next/link";

/**
 * Renders a styled message that prompts the user to sign in and provides a link to the login page so they can reserve a cabin.
 *
 * @returns A JSX element containing a centered paragraph with a link to `/login` styled for emphasis.
 */
function LoginMessage() {
	return (
		<div className="grid bg-primary-800">
			<p className="self-center py-12 text-center text-xl">
				Please{" "}
				<Link href="/login" className="text-accent-500 underline">
					login
				</Link>{" "}
				to reserve this
				<br /> cabin right now
			</p>
		</div>
	);
}

export default LoginMessage;