import { eachDayOfInterval } from "date-fns";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import { supabaseBrowser } from "./supabaseBrowser";
import { supabaseServer } from "./supabaseServer";

/////////////
// GET

export async function getCabin(id) {
  const { data, error } = await supabaseBrowser
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

  return data;
}

export async function getCabinPrice(id) {
  const { data, error } = await supabaseBrowser
    .from("cabins")
    .select("regularPrice, discount")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
  }

  return data;
}

export const getCabins = async function () {
  const { data, error } = await supabaseBrowser
    .from("cabins")
    .select("id, name, maxCapacity, regularPrice, discount, image")
    .order("name");

  // await new Promise((res) => setTimeout(res, 2000));

  if (error) {
    console.error(error);
    throw new Error("Cabins could not be loaded");
  }

  return data;
};

// Guests are uniquely identified by their email address
export async function getGuest(email) {
  const { data, error } = await supabaseBrowser
    .from("guests")
    .select("*")
    .eq("email", email)
    .single();

  // No error here! We handle the possibility of no guest in the sign in callback
  return data;
}

/**
 * Retrieve a single booking by its id, including selected cabin details.
 * @param {string|number} id - The booking's unique identifier.
 * @returns {Object} The booking record with nested `cabins` object containing `name`, `maxCapacity`, and `image`.
 * @throws {Error} If the booking query fails ("Booking could not get loaded") or if no booking is found ("Booking not found").
 */
export async function getBooking(id) {
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

  return data;
}

/**
 * Retrieve all bookings for a specific guest, ordered by start date.
 *
 * @param {string|number} guestId - Identifier of the guest whose bookings to fetch.
 * @returns {Array<Object>} An array of booking objects containing: `id`, `created_at`, `startDate`, `endDate`, `numNights`, `numGuests`, `totalPrice`, `guestId`, `cabinId`, and a `cabins` object with `name`, `image`, and `maxCapacity`.
 */
export async function getBookings(guestId) {
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

  return data;
}

export async function getBookedDatesByCabinId(cabinId) {
  let today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  today = today.toISOString();

  // await new Promise((res) => setTimeout(res, 5000));

  // Getting all bookings
  const { data, error } = await supabaseBrowser
    .from("bookings")
    .select("*")
    .eq("cabinId", cabinId)
    .or(`startDate.gte.${today},status.eq.checked-in`);

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
 * @returns {Object} The settings record from the "settings" table.
 * @throws {Error} Throws an error with message "Settings could not be loaded" if the database query fails.
 */
export async function getSettings() {
  const { data, error } = await supabaseServer
    .from("settings")
    .select("*")
    .single();

  if (error) {
    console.error(error);
    throw new Error("Settings could not be loaded");
  }

  return data;
}

const getCountriesCached = unstable_cache(
  async () => {
    try {
      const res = await fetch(
        "https://restcountries.com/v3.1/all?fields=name,flags"
      );

      if (!res.ok) throw new Error("Failed to load countries");

      const countries = await res.json();

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
  },
  ["countries"],
  { revalidate: 60 * 60 * 24 }
);

/**
 * Return a list of countries with a display name and flag URL.
 * @returns {Promise<Array<{name: string, flag: string}>>} An array of country objects where `name` is the country's common name and `flag` is a URL to the country's flag (SVG or PNG).
 */
export async function getCountries() {
  return getCountriesCached();
}

/////////////
/**
 * Creates a new guest record in the database.
 * @param {Object} newGuest - Guest data to insert; should contain the fields accepted by the `guests` table.
 * @returns {Object} The created guest record as returned by the database.
 * @throws {Error} When the insert fails; the thrown error's message will be "Guest could not be created" and it preserves the original database error `code`.
 */

export async function createGuest(newGuest) {
  const { data, error } = await supabaseServer
    .from("guests")
    .insert([newGuest])
    .select()
    .single();

  if (error) {
    console.error(error);
    const wrappedError = new Error("Guest could not be created");
    wrappedError.code = error.code;
    throw wrappedError;
  }

  return data;
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