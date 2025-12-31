"use client";

import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import type { Session } from "next-auth";

interface NavigationMenuProps {
	session: Session | null;
}

/**
 * Render a responsive navigation bar with desktop links and a toggleable mobile menu.
 *
 * @param session - Session object (or null) used to display the account area: shows the user's name and avatar when available; otherwise displays a "Guest area" link
 * @returns The navigation element containing the site links and the account area for desktop and mobile layouts
 */
function NavigationMenu({ session }: NavigationMenuProps) {
	const [isOpen, setIsOpen] = useState(false);

	const toggleMenu = () => setIsOpen((prev) => !prev);
	const closeMenu = () => setIsOpen(false);

	// Close menu on Escape key press
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen) {
				closeMenu();
			}
		};

		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [isOpen]);

	const links = [
		{ href: "/cabins", label: "Cabins" },
		{ href: "/about", label: "About" },
	];

	return (
		<div className="relative">
			<button
				type="button"
				onClick={toggleMenu}
				className="flex items-center justify-center rounded-md border border-primary-700 p-2 text-primary-200 transition-colors hover:border-accent-400 hover:text-accent-400 md:hidden"
				aria-expanded={isOpen}
				aria-label="Toggle navigation"
				aria-controls="mobile-navigation-menu"
			>
				{isOpen ? (
					<XMarkIcon className="size-5" />
				) : (
					<Bars3Icon className="size-5" />
				)}
			</button>

			<nav className="hidden md:block">
				<ul className="flex items-center gap-2 text-lg">
					{links.map((link) => (
						<li key={link.href}>
							<Link
								href={link.href}
								className="transition-colors hover:text-accent-400"
							>
								{link.label}
							</Link>
						</li>
					))}
					<li>
						{session?.user?.image ? (
							<Link
								href="/account"
								className="flex items-center gap-3 transition-colors hover:text-accent-400"
								onClick={closeMenu}
							>
								{" "}
								<span>{session.user.name}</span>
								<Image
									className="size-8 rounded-full"
									src={session.user.image}
									alt={session.user.name ?? "User avatar"}
									referrerPolicy="no-referrer"
									width={32}
									height={32}
								/>
							</Link>
						) : (
							<Link
								href="/account"
								className="transition-colors hover:text-accent-400"
								onClick={closeMenu}
							>
								Guest area
							</Link>
						)}
					</li>
				</ul>
			</nav>

			{isOpen ? (
				<div
					id="mobile-navigation-menu"
					className="absolute left-0 top-12 z-20 w-72 rounded-md border border-primary-800 bg-primary-950 p-2 opacity-80 shadow-lg md:hidden"
				>
					<nav>
						<ul className="flex flex-col items-center gap-3 text-base">
							<li>
								{session?.user?.image ? (
									<Link
										href="/account"
										className="flex flex-col items-center gap-2 rounded-md px-2 py-2 transition-colors hover:bg-primary-800 hover:text-accent-400"
										onClick={closeMenu}
									>
										<Image
											className="size-8 rounded-full"
											src={session.user.image}
											alt={session.user.name ?? "User avatar"}
											referrerPolicy="no-referrer"
											width={32}
											height={32}
										/>
										<span className="text-sm">{session.user.name}</span>
									</Link>
								) : (
									<Link
										href="/account"
										className="rounded-md px-2 py-2 transition-colors hover:bg-primary-800 hover:text-accent-400"
										onClick={closeMenu}
									>
										Guest area
									</Link>
								)}
							</li>

							{links.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className="block rounded-md px-2 py-2 transition-colors hover:bg-primary-800 hover:text-accent-400"
										onClick={closeMenu}
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</nav>
				</div>
			) : null}
		</div>
	);
}

export default NavigationMenu;