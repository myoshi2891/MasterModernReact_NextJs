import TextExpander from "@/app/_components/TextExpander";
import { EyeSlashIcon, MapPinIcon, UsersIcon } from "@heroicons/react/24/solid";
import Image from "next/image";

/**
 * Render a cabin card showing the cabin image, title, expandable description, and key features.
 *
 * @param {{name: string, maxCapacity: number, regularPrice?: number, discount?: number, image: string, description: string}} cabin - Cabin data used to populate the card.
 * @returns {JSX.Element} The JSX element representing the cabin card.
 */
function Cabin({ cabin }) {
  const { name, maxCapacity, regularPrice, discount, image, description } =
    cabin;

  return (
    <div className="mx-auto mb-24 grid w-full max-w-3xl gap-10 rounded-lg border border-primary-800 px-4 py-6 sm:px-6 lg:max-w-6xl lg:grid-cols-[3fr_2fr] lg:items-center lg:gap-16 lg:px-12 lg:py-10">
      <div className="relative aspect-[4/3] overflow-hidden rounded-md sm:aspect-[3/2] lg:aspect-[6/4] lg:h-[30rem]">
        <Image
          src={image}
          fill
          sizes="(min-width: 1024px) 45vw, (min-width: 640px) 70vw, 100vw"
          className="object-cover"
          alt={`Cabin ${name}`}
          loading="eager"
          fetchPriority="high"
        />
      </div>

      <div className="lg:pl-10 z-10">
        <h3 className="mb-5 bg-primary-950 px-4 py-2 text-4xl font-black text-accent-100 sm:text-5xl md:text-6xl lg:-translate-x-8 lg:px-6 lg:pb-1 lg:text-7xl xl:translate-x-0">
          Cabin {name}
        </h3>

        <p className="text-base text-primary-300 mb-8 sm:text-lg md:mb-10">
          <TextExpander>{description}</TextExpander>
        </p>

        <ul className="flex flex-col gap-4 mb-7">
          <li className="flex gap-3 items-center">
            <UsersIcon className="h-5 w-5 text-primary-600" />
            <span className="text-lg">
              For up to <span className="font-bold">{maxCapacity}</span> guests
            </span>
          </li>
          <li className="flex gap-3 items-center">
            <MapPinIcon className="h-5 w-5 text-primary-600" />
            <span className="text-lg">
              Located in the heart of the{" "}
              <span className="font-bold">Dolomites</span> (Italy)
            </span>
          </li>
          <li className="flex gap-3 items-center">
            <EyeSlashIcon className="h-5 w-5 text-primary-600" />
            <span className="text-lg">
              Privacy <span className="font-bold">100%</span> guaranteed
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Cabin;