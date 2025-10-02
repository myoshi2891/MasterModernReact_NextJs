import Navigation from "@/app/_components/Navigation";
import Logo from "@/app/_components/Logo";

function Header() {
	return (
		<header className="border-b border-primary-900 px-4 py-4 sm:px-6 md:px-8">
			<div className="mx-auto flex max-w-7xl flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
				<Logo />
				<Navigation />
			</div>
		</header>
	);
}

export default Header;
