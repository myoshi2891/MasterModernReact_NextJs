import localFont from "next/font/local";

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

export const metadata = {
  title: {
    template: "%s | The Wild Oasis",
    default: "Welcome to the Wild Oasis",
  },
  description:
    "Luxurious cabin hotel, located in the heart of the Italian Dolomites, surrounded by beautiful mountains and dark forests.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${josefin.className} antialiased bg-primary-950 text-primary-100 min-h-screen flex flex-col relative overflow-x-hidden`}
      >
        <Header />
        <div className="grid flex-1 px-4 py-12 sm:px-6 lg:px-8">
          <main className="max-w-7xl mx-auto w-full">
            <ReservationProvider>{children}</ReservationProvider>
          </main>
        </div>
      </body>
    </html>
  );
}
