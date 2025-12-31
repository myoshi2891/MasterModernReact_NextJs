import SideNavigation from "@/app/_components/SideNavigation";
import type { ReactNode } from "react";

interface LayoutProps {
	children: ReactNode;
}

/**
 * Render the account section layout with a persistent side navigation and a main content area in a responsive container.
 *
 * @param children - Content to display in the main content area (below navigation on mobile, to the right on large screens)
 * @returns A JSX element with a responsive layout: single-column flex on mobile, two-column grid on large screens
 */
export default function Layout({ children }: LayoutProps) {
	return (
		<div className="flex h-full flex-col gap-6 lg:grid lg:grid-cols-[16rem_1fr] lg:gap-12">
			<SideNavigation />
			<div className="py-1">{children}</div>
		</div>
	);
}