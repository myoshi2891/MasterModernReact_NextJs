"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, signIn, signOut } from "./auth";
import {
  calculateCabinPrice,
  calculateNumNights,
  validateBookingInput,
} from "./booking";
import { getBookings } from "./data-service";
import { normalizeNationalId } from "./guest";
import { supabaseServer } from "./supabaseServer";

/**
 * Update the authenticated guest's nationality, country flag, and national ID from submitted form data.
 *
 * Parses the `nationality` field (expected format "nationality%countryFlag") and normalizes the `nationalID`;
 * empty values are stored as `null`. After a successful update the account profile page is revalidated.
 *
 * @param {FormData} formData - Form data with keys `nationality` and `nationalID`.
 * @throws {Error} If the user is not authenticated.
 * @throws {Error} If the guest record could not be updated.
 */
export async function updateGuest(formData) {
  const session = await auth();
  if (!session) {
    throw new Error("You must be logged in");
  }

  const nationalIDRaw = normalizeNationalId(formData.get("nationalID"));
  const nationalityField = formData.get("nationality")?.toString() ?? "";
  const [nationality = "", countryFlag = ""] = nationalityField.split("%");

  const updateData = {
    nationality: nationality || null,
    countryFlag: countryFlag || null,
    nationalID: nationalIDRaw || null,
  };

  const { data, error } = await supabaseServer
    .from("guests")
    .update(updateData)
    .eq("id", session.user.guestId);

  if (error) {
    throw new Error("Guest could not be updated");
  }

  revalidatePath("/account/profile");
}

/**
 * Update an existing booking's guest count and observations for the authenticated guest.
 *
 * @param {FormData} formData - Form data containing `bookingId`, `numGuests`, and `observations`.
 * @throws {Error} If the user is not authenticated or has no associated guestId.
 * @throws {Error} If `numGuests` is not a finite integer greater than or equal to 1.
 * @throws {Error} If the booking does not belong to the authenticated guest.
 * @throws {Error} If `numGuests` exceeds the cabin's `maxCapacity` when that capacity is defined.
 * @throws {Error} If the database update operation fails.
 */
export async function updateBooking(formData) {
  const bookingId = Number(formData.get("bookingId"));
  const session = await auth();
  if (!session) throw new Error("You must be logged in");
  const guestId = session.user?.guestId;
  if (!guestId) throw new Error("You must be logged in");

  const numGuests = Number(formData.get("numGuests"));
  if (!Number.isFinite(numGuests) || numGuests <= 0) {
    throw new Error("Number of guests must be at least 1");
  }

  const guestBookings = await getBookings(guestId);
  const booking = guestBookings.find((item) => item.id === bookingId);

  if (!booking)
    throw new Error("You are not allowed to update this booking.");

  const maxCapacity = booking?.cabins?.maxCapacity;
  if (Number.isFinite(maxCapacity) && numGuests > maxCapacity) {
    throw new Error("Number of guests exceeds cabin capacity");
  }

  const updateData = {
    numGuests,
    observations: formData.get("observations").slice(0, 1000),
  };

  const { error } = await supabaseServer
    .from("bookings")
    .update(updateData)
    .eq("id", bookingId);

  if (error) throw new Error("Booking could not be updated");

  revalidatePath(`/account/reservations/edit/${bookingId}`);

  redirect("/account/reservations");
}

/**
 * Create a booking for the authenticated guest using the provided booking values and form inputs.
 *
 * Validates the booking dates, nights, and guest count against the cabin's capacity, constructs and inserts
 * a new booking record (with default flags and status "unconfirmed"), triggers revalidation for reservations and
 * the booked cabin, and redirects the user to the booking thank-you page.
 *
 * @param {Object} bookingData - Booking-related values for the requested stay.
 * @param {string|Date|null} bookingData.startDate - Requested start date.
 * @param {string|Date|null} bookingData.endDate - Requested end date.
 * @param {number} bookingData.numNights - Number of nights for the requested stay.
 * @param {string|number} bookingData.cabinId - Identifier of the cabin being booked.
 * @param {FormData} formData - Submitted form data; must include `numGuests` and may include `observations`.
 *
 * @throws {Error} When the user is not authenticated.
 * @throws {Error} When the cabin could not be loaded.
 * @throws {Error} When booking input validation fails (invalid dates, nights, or guest count).
 * @throws {Error} When the booking record could not be created.
 */
export async function createBooking(bookingData, formData) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in");
  const guestId = session.user?.guestId;
  if (!guestId) throw new Error("You must be logged in");

  const numGuests = Number(formData.get("numGuests"));
  const startDate = bookingData.startDate
    ? new Date(bookingData.startDate)
    : null;
  const endDate = bookingData.endDate ? new Date(bookingData.endDate) : null;
  const cabinId = bookingData.cabinId;

  const { data: cabin, error: cabinError } = await supabaseServer
    .from("cabins")
    .select("maxCapacity, regularPrice, discount")
    .eq("id", cabinId)
    .single();

  if (cabinError || !cabin) {
    throw new Error("Cabin could not be loaded");
  }

  validateBookingInput({
    startDate,
    endDate,
    numNights: bookingData.numNights,
    numGuests,
    maxCapacity: cabin.maxCapacity,
    regularPrice: cabin.regularPrice,
    discount: cabin.discount,
  });

  const numNights = calculateNumNights(startDate, endDate);
  const cabinPrice = calculateCabinPrice(
    numNights,
    cabin.regularPrice,
    cabin.discount
  );

  const newBooking = {
    startDate,
    endDate,
    numNights,
    cabinPrice,
    cabinId,
    guestId,
    numGuests,
    observations: formData.get("observations").slice(0, 1000),
    extrasPrice: 0,
    totalPrice: cabinPrice,
    isPaid: false,
    hasBreakfast: false,
    status: "unconfirmed",
  };

  const { error } = await supabaseServer.from("bookings").insert([newBooking]);

  if (error) {
    throw new Error("Booking could not be created");
  }

  revalidatePath("/account/reservations");
  revalidatePath(`/cabins/${cabinId}`);
  redirect("/cabins/thankyou");
}

/**
 * Remove a booking owned by the currently authenticated guest and revalidate the reservations page.
 *
 * @param {string} bookingId - ID of the booking to delete.
 * @throws {Error} If the user is not authenticated or has no associated guestId.
 * @throws {Error} If the specified bookingId is not owned by the authenticated guest.
 * @throws {Error} If the deletion operation fails.
 */
export async function deleteBooking(bookingId) {
  const session = await auth();
  if (!session) {
    throw new Error("You must be logged in");
  }

  const guestId = session.user?.guestId;
  if (!guestId) {
    throw new Error("You must be logged in");
  }

  const guestBookings = await getBookings(guestId);
  const guestBookingIds = guestBookings.map((booking) => booking.id);

  if (!guestBookingIds.includes(bookingId)) {
    throw new Error("You are not allowed to delete this booking.");
  }

  const { error } = await supabaseServer
    .from("bookings")
    .delete()
    .eq("id", bookingId);

  if (error) {
    throw new Error("Booking could not be deleted");
  }

  revalidatePath("/account/reservations");
}

export async function signInAction() {
  await signIn("google", { redirectTo: "/account" });
}

/**
 * Signs the current user out and redirects to the site root ("/").
 */
export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
