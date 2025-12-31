import SideNavigation from "@/app/_components/SideNavigation";
import type { ReactNode } from "react";

interface LayoutProps {
	children: ReactNode;
}

/**
 * Render the account section layout with a persistent side navigation and a main content area.
 *
 * @param children - Content to display in the main content area to the right of the side navigation
 * @returns A JSX element containing a two-column grid with the side navigation on the left and `children` on the right
 */
export default function Layout({ children }: LayoutProps) {
	return (
		<div className="grid h-full grid-cols-[16rem_1fr] gap-12">
			<SideNavigation /> <div className="py-1">{children}</div>
		</div>
	);
}