"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, signIn, signOut } from "./auth";
import { validateBookingInput } from "./booking";
import { getBookings } from "./data-service";
import { normalizeNationalId } from "./guest";
import { supabaseServer } from "./supabaseServer";

export async function updateGuest(formData) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const nationalIDRaw = normalizeNationalId(formData.get("nationalID"));
  const nationalityField = formData.get("nationality")?.toString() ?? "";
  const [nationality = "", countryFlag = ""] = nationalityField.split("%");

  if (nationalIDRaw && !/^[a-zA-Z0-9]{6,12}$/.test(nationalIDRaw))
    throw new Error("Please provide a valid national ID");

  const updateData = {
    nationality: nationality || null,
    countryFlag: countryFlag || null,
    nationalID: nationalIDRaw || null,
  };

  const { data, error } = await supabaseServer
    .from("guests")
    .update(updateData)
    .eq("id", session.user.guestId);

  if (error) throw new Error("Guest could not be updated");

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
 * Create a new booking record for the authenticated guest using supplied booking and form data.
 *
 * Validates booking input (dates, nights, guest count against cabin capacity), truncates observations to 1000 characters,
 * inserts a booking with default flags (unpaid, no breakfast) and status "unconfirmed", triggers path revalidation for
 * reservations and the booked cabin, and redirects the user to the booking thank-you page.
 *
 * @param {Object} bookingData - Booking-related values derived from the selected cabin and requested stay.
 * @param {string} bookingData.startDate - Booking start date (ISO string or date-like).
 * @param {string} bookingData.endDate - Booking end date (ISO string or date-like).
 * @param {number} bookingData.numNights - Number of nights for the booking.
 * @param {number} bookingData.cabinPrice - Price for the cabin used as the booking base price.
 * @param {string|number} bookingData.cabinId - Identifier of the cabin being booked.
 * @param {number} bookingData.maxCapacity - Cabin maximum guest capacity used for validation.
 * @param {FormData} formData - Form data submitted by the user; must include `numGuests` and may include `observations`.
 */
export async function createBooking(bookingData, formData) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in");
  const guestId = session.user?.guestId;
  if (!guestId) throw new Error("You must be logged in");

  const numGuests = Number(formData.get("numGuests"));

  validateBookingInput({
    startDate: bookingData.startDate,
    endDate: bookingData.endDate,
    numNights: bookingData.numNights,
    numGuests,
    maxCapacity: bookingData.maxCapacity,
  });

  const newBooking = {
    startDate: bookingData.startDate,
    endDate: bookingData.endDate,
    numNights: bookingData.numNights,
    cabinPrice: bookingData.cabinPrice,
    cabinId: bookingData.cabinId,
    guestId,
    numGuests,
    observations: formData.get("observations").slice(0, 1000),
    extrasPrice: 0,
    totalPrice: bookingData.cabinPrice,
    isPaid: false,
    hasBreakfast: false,
    status: "unconfirmed",
  };

  const { error } = await supabaseServer.from("bookings").insert([newBooking]);

  if (error) throw new Error("Booking could not be created");

  revalidatePath("/account/reservations");
  revalidatePath(`/cabins/${bookingData.cabinId}`);
  redirect("/cabins/thankyou");
}

/**
 * Delete a booking owned by the currently authenticated guest and revalidate the reservations page.
 *
 * @param {string} bookingId - ID of the booking to delete.
 * @throws {Error} If the user is not authenticated.
 * @throws {Error} If the authenticated user has no associated guestId.
 * @throws {Error} If the bookingId does not belong to the authenticated guest.
 * @throws {Error} If the deletion operation fails.
 */
export async function deleteBooking(bookingId) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const guestId = session.user?.guestId;
  if (!guestId) throw new Error("You must be logged in");

  const guestBookings = await getBookings(guestId);
  const guestBookingIds = guestBookings.map((booking) => booking.id);

  if (!guestBookingIds.includes(bookingId))
    throw new Error("You are not allowed to delete this booking.");

  const { error } = await supabaseServer
    .from("bookings")
    .delete()
    .eq("id", bookingId);

  if (error) throw new Error("Booking could not be deleted");

  revalidatePath("/account/reservations");
}

export async function signInAction() {
  await signIn("google", { redirectTo: "/account" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}