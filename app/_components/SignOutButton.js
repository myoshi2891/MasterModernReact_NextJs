"use client";

import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";
import { signOut } from "next-auth/react";

function SignOutButton() {
	return (
		<button
			type="button"
			onClick={() => signOut({ callbackUrl: "/" })}
			className="py-3 px-5 hover:bg-primary-900 hover:text-primary-100 transition-colors flex items-center gap-4 font-semibold text-primary-200 w-full"
		>
			<ArrowRightOnRectangleIcon className="h-5 w-5 text-primary-600" />
			<span>Sign out</span>
		</button>
	);
}

export default SignOutButton;
