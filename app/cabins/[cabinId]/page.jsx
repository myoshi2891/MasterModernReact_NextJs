import Cabin from "@/app/_components/Cabin";
import Reservation from "@/app/_components/Reservation";
import Spinner from "@/app/_components/Spinner";
import { getCabin, getCabins } from "@/app/_lib/data-service";
import { Suspense } from "react";

// export const metadata = {
// 	title: "Cabin",
/**
 * Produce page metadata for a cabin route.
 *
 * When `SKIP_SSG` equals `"true"` the title is `"Cabin"`; otherwise the title is `"Cabin <name>"` where `<name>` is the fetched cabin name for the provided `cabinId`.
 * @param {{ params: { cabinId: string } }} context - Route context containing `params.cabinId`.
 * @returns {{ title: string }} `title` is `"Cabin"` when `SKIP_SSG === "true"`, otherwise `"Cabin <name>"` with the cabin's name.
 */

export async function generateMetadata({ params }) {
  if (process.env.SKIP_SSG === "true") {
    return { title: "Cabin" };
  }
  const { name } = await getCabin(params.cabinId);
  return { title: `Cabin ${name}` };
}

/**
 * Provides route parameters for static pre-rendering of cabin pages.
 *
 * When SKIP_SSG is set to "true", returns an empty array. Otherwise, fetches all
 * cabins and returns an array of objects each containing `cabinId` as a string.
 *
 * @returns {Array<{cabinId: string}>} An array of param objects for pre-rendering; empty if SKIP_SSG === "true".
 */
export async function generateStaticParams() {
  if (process.env.SKIP_SSG === "true") {
    return [];
  }
  const cabins = await getCabins();
  const ids = cabins.map((cabin) => ({ cabinId: String(cabin.id) }));

  return ids;
}

/**
 * Render the cabin details and reservation UI for the cabin specified by `params.cabinId`.
 *
 * Note: SKIP_SSG only affects generateStaticParams (build-time). At runtime,
 * this page renders dynamically even when no static params were generated.
 *
 * @param {{ params: { cabinId: string } }} props - Route props object.
 * @param {string} props.params.cabinId - The identifier of the cabin to fetch and display.
 * @returns {JSX.Element} A React element containing the cabin details and a reservation section.
 */
export default async function Page({ params }) {
  const cabin = await getCabin(params.cabinId);

  return (
    <div className="mx-auto mt-6 max-w-6xl px-4 sm:mt-8 sm:px-6 lg:px-0 ">
      <Cabin cabin={cabin} />
      <div className="space-y-6 sm:space-y-8">
        <h2 className="text-center text-3xl font-semibold text-accent-400 sm:text-4xl md:text-5xl">
          Reserve {cabin.name} today. Pay on arrival.
        </h2>
        <Suspense fallback={<Spinner />}>
          <Reservation cabin={cabin} />
        </Suspense>
      </div>
    </div>
  );
}
