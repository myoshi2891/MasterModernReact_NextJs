import localFont from "next/font/local";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/app/_styles/globals.css";
import Header from "./_components/Header";
import { ReservationProvider } from "./_components/ReservationContext";

const josefin = localFont({
	src: [
		{
			path: "./fonts/JosefinSans-VariableFont_wght.ttf",
			weight: "100 700",
			style: "normal",
		},
		{
			path: "./fonts/JosefinSans-Italic-VariableFont_wght.ttf",
			weight: "100 700",
			style: "italic",
		},
	],
	display: "swap",
});

export const metadata: Metadata = {
	title: {
		template: "%s | The Wild Oasis",
		default: "Welcome to the Wild Oasis",
	},
	description:
		"Luxurious cabin hotel, located in the heart of the Italian Dolomites, surrounded by beautiful mountains and dark forests.",
};

interface RootLayoutProps {
	children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
	return (
		<html lang="en">
			<body
				className={`${josefin.className} relative flex min-h-screen flex-col overflow-x-hidden bg-primary-950 text-primary-100 antialiased`}
			>
				<Header />
				<div className="grid flex-1 px-4 py-12 sm:px-6 lg:px-8">
					<main className="mx-auto w-full max-w-7xl">
						<ReservationProvider>{children}</ReservationProvider>
					</main>
				</div>
			</body>
		</html>
	);
}
