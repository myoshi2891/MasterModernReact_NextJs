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
