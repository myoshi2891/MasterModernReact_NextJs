import Image from "next/image";
import Link from "next/link";
import logo from "@/public/logo.png";

/**
 * Renders the site brand as a linked logo and text that navigates to the root path.
 *
 * @returns The JSX element containing the logo image and the "The Wild Oasis" text wrapped in a link to `/`.
 */
function Logo() {
	return (
		<Link href="/" className="z-10 flex items-center gap-4">
			<Image
				src={logo}
				height={60}
				width={60}
				quality={100}
				priority
				sizes="60px"
				alt="The Wild Oasis logo"
			/>
			<span className="text-xl font-semibold text-primary-100">
				The Wild Oasis
			</span>
		</Link>
	);
}

export default Logo;