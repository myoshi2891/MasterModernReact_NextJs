"use client";

import {
	CalendarDaysIcon,
	HomeIcon,
	UserIcon,
} from "@heroicons/react/24/solid";
import SignOutButton from "./SignOutButton";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface NavLink {
	name: string;
	href: string;
	icon: ReactNode;
}

const navLinks: NavLink[] = [
	{
		name: "Home",
		href: "/account",
		icon: <HomeIcon className="h-5 w-5 text-primary-600" />,
	},
	{
		name: "Reservations",
		href: "/account/reservations",
		icon: <CalendarDaysIcon className="h-5 w-5 text-primary-600" />,
	},
	{
		name: "Guest profile",
		href: "/account/profile",
		icon: <UserIcon className="h-5 w-5 text-primary-600" />,
	},
];

/**
 * Renders the account side navigation containing page links and a sign-out control.
 *
 * The link whose `href` matches the current pathname is visually highlighted.
 *
 * @returns A navigation element with account page links and a sign-out button.
 */
function SideNavigation() {
	const pathname = usePathname();

	return (
		<nav className="border-r border-primary-900">
			<ul className="flex h-full flex-col gap-2 text-lg">
				{navLinks.map((link) => (
					<li key={link.name}>
						<Link
							className={`flex items-center gap-4 px-5 py-3 font-semibold text-primary-200 transition-colors hover:bg-primary-900 hover:text-primary-100 ${
								pathname === link.href ? "bg-primary-900" : ""
							}`}
							href={link.href}
						>
							{link.icon}
							<span>{link.name}</span>
						</Link>
					</li>
				))}

				<li className="mt-auto">
					<SignOutButton />
				</li>
			</ul>
		</nav>
	);
}

export default SideNavigation;