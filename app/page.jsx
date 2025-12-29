import Image from "next/image";
import Link from "next/link";

import bg from "@/public/bg.png";

/**
 * Render the landing page hero: full-bleed background image with centered heading and a CTA link to /cabins.
 *
 * @returns {JSX.Element} The React element tree for the page's hero section.
 */
export default function Page() {
  return (
    <div className="relative min-h-screen">
      <Image
        src={bg}
        fill
        quality={80}
        placeholder="blur"
        className="object-cover object-top"
        alt="Mountains and forests with two cabins"
      />

      <div className="relative z-10 text-center flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl sm:text-6xl md:text-8xl text-primary-50 mb-10 tracking-tight font-normal">
          Welcome to paradise.
        </h1>
        <Link
          href="/cabins"
          className="bg-accent-500 px-8 py-6 text-primary-800 text-lg font-semibold hover:bg-accent-600 transition-all"
        >
          Explore luxury cabins
        </Link>
      </div>
    </div>
  );
}