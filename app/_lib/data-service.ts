import { eachDayOfInterval } from "date-fns";
import { cache } from "react";
import { notFound } from "next/navigation";
import { supabaseServer } from "./supabaseServer";
import type { Cabin, Booking, Guest, Settings, Country } from "@/types/domain";

/**
 * Partial cabin data for list views.
 */
export interface CabinListItem {
  id: number;
  name: string;
  maxCapacity: number;
  regularPrice: number;
  discount: number;
  image: string | null;
}

/**
 * Pricing information for a cabin.
 */
export interface CabinPrice {
  regularPrice: number;
  discount: number;
}

/////////////
// GET

export async function getCabin(id: number | string): Promise<Cabin> {
  const { data, error } = await supabaseServer
    .from("cabins")
    .select("*")
    .eq("id", id)
    .single();

  // For testing
  // await new Promise((res) => setTimeout(res, 1000));

  if (error) {
    console.error(error);
    notFound();
  }

  return data as Cabin;
}

/**
 * Retrieve the price information for a cabin.
 *
 * Unlike other data-service functions that throw on error, this function
 * returns `null` on failure to allow graceful degradation in UI components.
 *
 * @param id - The cabin's unique identifier.
 * @returns The price info object, or `null` if the cabin is not found or on database error.
 */
export async function getCabinPrice(
  id: number | string
): Promise<CabinPrice | null> {
  const { data, error } = await supabaseServer
    .from("cabins")
    .select("regularPrice, discount")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data as CabinPrice;
}

export const getCabins = async function (): Promise<CabinListItem[]> {
  const { data, error } = await supabaseServer
    .from("cabins")
    .select("id, name, maxCapacity, regularPrice, discount, image")
    .order("name");

  // await new Promise((res) => setTimeout(res, 2000));

  if (error) {
    console.error(error);
    throw new Error("Cabins could not be loaded");
  }

  return data as CabinListItem[];
};

// Guests are uniquely identified by their email address
export async function getGuest(email: string): Promise<Guest | null> {
  const { data, error } = await supabaseServer
    .from("guests")
    .select("*")
    .eq("email", email)
    .single();

  // No error here! We handle the possibility of no guest in the sign in callback
  if (error) {
    return null;
  }
  return data as Guest;
}

/**
 * Booking with related cabin data.
 */
export interface BookingWithCabin extends Booking {
  cabins: Pick<Cabin, "name" | "maxCapacity" | "image">;
}

/**
 * Retrieve a single booking by its id, including selected cabin details.
 * @param id - The booking's unique identifier.
 * @returns The booking record with nested `cabins` object containing `name`, `maxCapacity`, and `image`.
 * @throws Error If the booking query fails ("Booking could not get loaded") or if no booking is found ("Booking not found").
 */
export async function getBooking(
  id: number | string
): Promise<BookingWithCabin> {
  const { data, error } = await supabaseServer
    .from("bookings")
    .select("*, cabins(name, maxCapacity, image)")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    throw new Error("Booking could not get loaded");
  }

  if (!data) {
    throw new Error("Booking not found");
  }

  return data as BookingWithCabin;
}

/**
 * Booking list item with selected cabin data.
 */
export interface BookingListItem {
  id: number;
  created_at: string;
  startDate: string;
  endDate: string;
  numNights: number;
  numGuests: number;
  totalPrice: number;
  guestId: number;
  cabinId: number;
  cabins: Pick<Cabin, "name" | "image" | "maxCapacity">;
}

/**
 * Retrieve all bookings for a specific guest, ordered by start date.
 *
 * @param guestId - Identifier of the guest whose bookings to fetch.
 * @returns An array of booking objects containing: `id`, `created_at`, `startDate`, `endDate`, `numNights`, `numGuests`, `totalPrice`, `guestId`, `cabinId`, and a `cabins` object with `name`, `image`, and `maxCapacity`.
 */
export async function getBookings(
  guestId: number | string
): Promise<BookingListItem[]> {
  const { data, error } = await supabaseServer
    .from("bookings")
    // We actually also need data on the cabins as well. But let's ONLY take the data that we actually need, in order to reduce downloaded data.
    .select(
      "id, created_at, startDate, endDate, numNights, numGuests, totalPrice, guestId, cabinId, cabins(name, image, maxCapacity)"
    )
    .eq("guestId", guestId)
    .order("startDate");

  if (error) {
    console.error(error);
    throw new Error("Bookings could not get loaded");
  }

  return data as unknown as BookingListItem[];
}

export async function getBookedDatesByCabinId(
  cabinId: number | string
): Promise<Date[]> {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  // await new Promise((res) => setTimeout(res, 5000));

  // Getting all bookings
  const { data, error } = await supabaseServer
    .from("bookings")
    .select("*")
    .eq("cabinId", cabinId)
    .or(`startDate.gte.${todayISO},status.eq.checked-in`);

  if (error) {
    console.error(error);
    throw new Error("Bookings could not get loaded");
  }

  // Converting to actual dates to be displayed in the date picker
  const bookedDates = data
    .map((booking) => {
      return eachDayOfInterval({
        start: new Date(booking.startDate),
        end: new Date(booking.endDate),
      });
    })
    .flat();

  return bookedDates;
}

/**
 * Retrieve the single settings record from the database.
 * @returns The settings record from the "settings" table.
 * @throws Error Throws an error with message "Settings could not be loaded" if the database query fails.
 */
export async function getSettings(): Promise<Settings> {
  const { data, error } = await supabaseServer
    .from("settings")
    .select("*")
    .single();

  if (error) {
    console.error(error);
    throw new Error("Settings could not be loaded");
  }

  return data as Settings;
}

/**
 * React 18.2以前またはテスト環境で `cache` が未定義の場合のフォールバック。
 * 本番環境 (Next.js 14+) では常に React の `cache` が使用される。
 *
 * - `cache` が関数として存在する場合: React のリクエストスコープキャッシュを使用
 * - `cache` が未定義の場合: 関数をそのまま返すアイデンティティ関数にフォールバック
 *
 * @see https://react.dev/reference/react/cache
 */
const cacheFn =
  typeof cache === "function"
    ? cache
    : <T extends (...args: never[]) => unknown>(fn: T) => fn;

const getCountriesCached = cacheFn(async (): Promise<Country[]> => {
  try {
    const res = await fetch(
      "https://restcountries.com/v3.1/all?fields=name,flags",
      { next: { revalidate: 60 * 60 * 24 } }
    );

    if (!res.ok) throw new Error("Failed to load countries");

    const countries = (await res.json()) as Array<{
      name?: { common?: string };
      flags?: { svg?: string; png?: string };
    }>;

    return countries
      .map((country) => ({
        name: country?.name?.common ?? "",
        flag: country?.flags?.svg ?? country?.flags?.png ?? "",
      }))
      .filter((country) => country.name);
  } catch (error) {
    console.error(error);
    throw new Error("Could not fetch countries");
  }
});

/**
 * Return a list of countries with a display name and flag URL.
 * @returns An array of country objects where `name` is the country's common name and `flag` is a URL to the country's flag (SVG or PNG).
 */
export async function getCountries(): Promise<Country[]> {
  return getCountriesCached();
}

/////////////

/**
 * Input for creating a new guest.
 */
export interface NewGuestInput {
  email: string;
  fullName: string;
  nationalID?: string;
  nationality?: string;
  countryFlag?: string;
}

/**
 * Custom error with code property for database errors.
 */
export interface DatabaseError extends Error {
  code?: string;
}

/**
 * Creates a new guest record in the database.
 * @param newGuest - Guest data to insert; should contain the fields accepted by the `guests` table.
 * @returns The created guest record as returned by the database.
 * @throws Error When the insert fails; the thrown error's message will be "Guest could not be created" and it preserves the original database error `code`.
 */
export async function createGuest(newGuest: NewGuestInput): Promise<Guest> {
  const { data, error } = await supabaseServer
    .from("guests")
    .insert([newGuest])
    .select()
    .single();

  if (error) {
    console.error(error);
    const wrappedError = new Error("Guest could not be created") as DatabaseError;
    wrappedError.code = error.code;
    throw wrappedError;
  }

  return data as Guest;
}

/*
export async function createBooking(newBooking) {
  const { data, error } = await supabase
    .from('bookings')
    .insert([newBooking])
    // So that the newly created object gets returned!
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error('Booking could not be created');
  }

  return data;
}
*/

/////////////
// UPDATE
/*
// The updatedFields is an object which should ONLY contain the updated data
export async function updateGuest(id, updatedFields) {
  const { data, error } = await supabase
    .from('guests')
    .update(updatedFields)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error('Guest could not be updated');
  }
  return data;
}

export async function updateBooking(id, updatedFields) {
  const { data, error } = await supabase
    .from('bookings')
    .update(updatedFields)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error('Booking could not be updated');
  }
  return data;
}

/////////////
// DELETE

export async function deleteBooking(id) {
  const { data, error } = await supabase.from('bookings').delete().eq('id', id);

  if (error) {
    console.error(error);
    throw new Error('Booking could not be deleted');
  }
  return data;
}

*/
