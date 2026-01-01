"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import {
  calculateCabinPrice,
  calculateNumNights,
  validateBookingInput,
} from "./booking";
import { getBookings } from "./data-service";
import { mapSupabaseError } from "./errors";
import { normalizeNationalId } from "./guest";
import { supabaseServer } from "./supabaseServer";

function normalizeObservations(value: FormDataEntryValue | null): string {
  const observations = typeof value === "string" ? value : "";
  return observations.slice(0, 1000);
}

/**
 * Booking data passed from the client for creating a new booking.
 */
export interface CreateBookingData {
  startDate: string | Date | null;
  endDate: string | Date | null;
  numNights: number;
  cabinId: string | number;
  /** Client-generated UUID for idempotency (prevents duplicate submissions) */
  clientRequestId?: string;
}

/**
 * Update the authenticated guest's nationality, country flag, and national ID from submitted form data.
 *
 * Parses the `nationality` field (expected format "nationality%countryFlag") and normalizes the `nationalID`;
 * empty values are stored as `null`. After a successful update the account profile page is revalidated.
 *
 * @param formData - Form data with keys `nationality` and `nationalID`.
 * @throws Error If the user is not authenticated.
 * @throws Error If the guest record could not be updated.
 */
export async function updateGuest(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session) {
    throw new Error("You must be logged in");
  }

  const nationalIDRaw = normalizeNationalId(
    formData.get("nationalID")?.toString()
  );
  const nationalityField = formData.get("nationality")?.toString() ?? "";
  const [nationality = "", countryFlag = ""] = nationalityField.split("%");

  const updateData = {
    nationality: nationality || null,
    countryFlag: countryFlag || null,
    nationalID: nationalIDRaw || null,
  };

  const { error } = await supabaseServer
    .from("guests")
    .update(updateData)
    .eq("id", session.user.guestId);

  if (error) {
    throw new Error("Guest could not be updated");
  }

  revalidatePath("/account/profile");
}

/**
 * Update the authenticated guest's booking with a new guest count and observations.
 *
 * Updates the booking record, triggers page revalidation for the edit page, and redirects to the reservations list.
 *
 * @param formData - Form data containing `bookingId`, `numGuests`, and optional `observations`.
 * @throws Error If the user is not authenticated or has no associated guestId.
 * @throws Error If `numGuests` is not a finite integer greater than or equal to 1.
 * @throws Error If the booking does not belong to the authenticated guest.
 * @throws Error If `numGuests` exceeds the cabin's `maxCapacity` when that capacity is defined.
 * @throws Error If the database update operation fails.
 */
export async function updateBooking(formData: FormData): Promise<void> {
  const bookingId = Number(formData.get("bookingId"));
  const session = await auth();
  if (!session) {
    throw new Error("You must be logged in");
  }
  const guestId = session.user?.guestId;
  if (!guestId) {
    throw new Error("You must be logged in");
  }

  const numGuests = Number(formData.get("numGuests"));
  if (!Number.isFinite(numGuests) || numGuests <= 0) {
    throw new Error("Number of guests must be at least 1");
  }

  const guestBookings = await getBookings(guestId);
  const booking = guestBookings.find((item) => item.id === bookingId);

  if (!booking) {
    throw new Error("You are not allowed to update this booking.");
  }

  const maxCapacity = booking?.cabins?.maxCapacity;
  if (Number.isFinite(maxCapacity) && numGuests > maxCapacity) {
    throw new Error("Number of guests exceeds cabin capacity");
  }

  const observations = normalizeObservations(formData.get("observations"));

  const updateData = {
    numGuests,
    observations,
  };

  const { error } = await supabaseServer
    .from("bookings")
    .update(updateData)
    .eq("id", bookingId);

  if (error) {
    throw mapSupabaseError(error);
  }

  revalidatePath(`/account/reservations/edit/${bookingId}`);

  redirect("/account/reservations");
}

/**
 * Create a new unconfirmed booking for the authenticated guest using provided booking values and form inputs.
 *
 * Validates the requested dates, nights, and guest count against the cabin's constraints, inserts a booking record
 * with default flags and pricing, then revalidates relevant pages and redirects to the booking thank-you page.
 *
 * @param bookingData - Booking-related values for the requested stay.
 * @param formData - Submitted form data; must include `numGuests` and may include `observations`.
 *
 * @throws Error When the user is not authenticated.
 * @throws Error When the cabin could not be loaded.
 * @throws Error When booking input validation fails (invalid dates, nights, or guest count).
 * @throws Error When the booking record could not be created.
 */
export async function createBooking(
  bookingData: CreateBookingData,
  formData: FormData
): Promise<void> {
  const session = await auth();
  if (!session) {
    throw new Error("You must be logged in");
  }
  const guestId = session.user?.guestId;
  if (!guestId) {
    throw new Error("You must be logged in");
  }

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

  const numNights = calculateNumNights(startDate!, endDate!);
  const cabinPrice = calculateCabinPrice(
    numNights,
    cabin.regularPrice,
    cabin.discount
  );
  const observations = normalizeObservations(formData.get("observations"));

  const newBooking = {
    startDate: startDate!,
    endDate: endDate!,
    numNights,
    cabinPrice,
    cabinId: Number(cabinId),
    guestId,
    numGuests,
    observations,
    extrasPrice: 0,
    totalPrice: cabinPrice,
    isPaid: false,
    hasBreakfast: false,
    status: "unconfirmed" as const,
    ...(bookingData.clientRequestId && {
      clientRequestId: bookingData.clientRequestId,
    }),
  };

  const { error } = await supabaseServer.from("bookings").insert([newBooking]);

  if (error) {
    throw mapSupabaseError(error);
  }

  revalidatePath("/account/reservations");
  revalidatePath(`/cabins/${cabinId}`);
  redirect("/cabins/thankyou");
}

/**
 * Remove a booking owned by the currently authenticated guest and revalidate the reservations page.
 *
 * @param bookingId - ID of the booking to delete.
 * @throws Error If the user is not authenticated or has no associated guestId.
 * @throws Error If the specified bookingId is not owned by the authenticated guest.
 * @throws Error If the deletion operation fails.
 */
export async function deleteBooking(bookingId: string | number): Promise<void> {
  const numericBookingId = Number(bookingId);
  if (!Number.isFinite(numericBookingId)) {
    throw new Error("Invalid booking ID");
  }

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

  if (!guestBookingIds.includes(numericBookingId)) {
    throw new Error("You are not allowed to delete this booking.");
  }

  const { error } = await supabaseServer
    .from("bookings")
    .delete()
    .eq("id", numericBookingId);

  if (error) {
    throw mapSupabaseError(error);
  }

  revalidatePath("/account/reservations");
}