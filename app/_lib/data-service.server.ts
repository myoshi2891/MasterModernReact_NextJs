// app/_lib/data-service.server.ts
export const runtime = "nodejs";

import { eachDayOfInterval } from "date-fns";
import { notFound } from "next/navigation";
import type { Tables, TablesInsert } from "@/types/supabase";
import { getSupabaseServiceClient } from "./supabaseServer";

// サーバ用クライアント取得（※関数呼び出しにするのが重要！）
const supabase = () => getSupabaseServiceClient();

export async function getCabin(id: string) {
  const { data, error } = await supabase()
    .from("cabins")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    notFound();
  }
  return data;
}

export async function getCabinPrice(id: string) {
  const { data, error } = await supabase()
    .from("cabins")
    .select("regularPrice, discount")
    .eq("id", id)
    .single();

  if (error) console.error(error);
  return data;
}

export async function getCabins() {
  const { data, error } = await supabase()
    .from("cabins")
    .select("id, name, maxCapacity, regularPrice, discount, image")
    .order("name");

  if (error) {
    console.error(error);
    throw new Error("Cabins could not be loaded");
  }
  return data;
}

export async function getBookedDatesByCabinId(cabinId: string) {
  let today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const iso = today.toISOString();

  const { data, error } = await supabase()
    .from("bookings")
    .select("*")
    .eq("cabinId", cabinId)
    .or(`startDate.gte.${iso},status.eq.checked-in`);

  if (error) {
    console.error(error);
    throw new Error("Bookings could not get loaded");
  }

  const bookedDates = data
    .map((booking) =>
      eachDayOfInterval({
        start: new Date(booking.startDate),
        end: new Date(booking.endDate),
      })
    )
    .flat();

  return bookedDates;
}

export async function getBooking(id: string) {
  const { data, error } = await supabase()
    .from("bookings")
    .select("*, cabins(name, maxCapacity, image)")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    throw new Error("Booking could not get loaded");
  }
  if (!data) throw new Error("Booking not found");
  return data;
}

export async function getBookings(guestId: string) {
  const { data, error } = await supabase()
    .from("bookings")
    .select(
      "id, created_at, startDate, endDate, numNights, numGuests, totalPrice, guestId, cabinId, cabins(name, image)"
    )
    .eq("guestId", guestId)
    .order("startDate");

  if (error) {
    console.error(error);
    throw new Error("Bookings could not get loaded");
  }
  return data;
}

export async function getSettings() {
  const { data, error } = await supabase()
    .from("settings")
    .select("*")
    .single();

  if (error) {
    console.error(error);
    throw new Error("Settings could not be loaded");
  }
  return data;
}

type GuestRow = Tables<"guests">;
type GuestInsert = TablesInsert<"guests">;

export async function getGuest(email: string): Promise<GuestRow | null> {
  if (!email) return null;

  const { data, error } = await supabase()
    .from("guests")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    console.error(error);
    throw new Error("Guest could not be loaded");
  }

  return data;
}

export async function createGuest(
  payload: GuestInsert
): Promise<GuestRow | null> {
  const insertPayload: GuestInsert = {
    fullName: null,
    nationalID: null,
    nationality: null,
    countryFlag: null,
    ...payload,
  };

  const { data, error } = await supabase()
    .from("guests")
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Guest could not be created");
  }

  return data;
}

type Country = {
  name: string;
  flag: string;
};

const COUNTRIES_ENDPOINT =
  "https://restcountries.com/v3.1/all?fields=name,flags,cca2";
const ONE_WEEK_IN_SECONDS = 60 * 60 * 24 * 7;

export async function getCountries(): Promise<Country[]> {
  try {
    const res = await fetch(COUNTRIES_ENDPOINT, {
      next: { revalidate: ONE_WEEK_IN_SECONDS, tags: ["countries"] },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch countries: ${res.statusText}`);
    }

    const data = (await res.json()) as Array<{
      name?: { common?: string };
      flags?: { svg?: string; png?: string; emoji?: string };
      flag?: string;
      cca2?: string;
    }>;

    return normalizeCountries(data);
  } catch (error) {
    console.error("[getCountries] Failed", error);
    return getLocalCountries();
  }
}

function normalizeCountries(
  payload: Array<{
    name?: { common?: string };
    flags?: { svg?: string; png?: string; emoji?: string };
    flag?: string;
    cca2?: string;
  }>
): Country[] {
  return payload
    .map((country) => {
      const code = (country.cca2 ?? "").toUpperCase();
      return {
        name: country.name?.common ?? "",
        flag:
          country.flag ??
          country.flags?.emoji ??
          deriveFlagFromIso(code) ??
          country.flags?.svg ??
          country.flags?.png ??
          "",
      };
    })
    .filter((country): country is Country => Boolean(country.name))
    .sort((a, b) => a.name.localeCompare(b.name));
}

let cachedLocalCountries: Country[] | null = null;

function getLocalCountries(): Country[] {
  if (cachedLocalCountries) return cachedLocalCountries;

  const regionCodes = getIsoCountryCodes();

  const displayNames = new Intl.DisplayNames(["en"], { type: "region" });

  cachedLocalCountries = regionCodes
    .filter((code) => /^[A-Z]{2}$/i.test(code))
    .map((code) => {
      const upper = code.toUpperCase();
      const name = displayNames.of(upper);
      return {
        name: typeof name === "string" ? name : undefined,
        flag: deriveFlagFromIso(upper) ?? "",
      };
    })
    .filter((country): country is Country => Boolean(country.name))
    .sort((a, b) => a.name.localeCompare(b.name));

  return cachedLocalCountries;
}

const FALLBACK_ISO_CODES = [
  "AF",
  "AX",
  "AL",
  "DZ",
  "AS",
  "AD",
  "AO",
  "AI",
  "AQ",
  "AG",
  "AR",
  "AM",
  "AW",
  "AU",
  "AT",
  "AZ",
  "BS",
  "BH",
  "BD",
  "BB",
  "BY",
  "BE",
  "BZ",
  "BJ",
  "BM",
  "BT",
  "BO",
  "BQ",
  "BA",
  "BW",
  "BV",
  "BR",
  "IO",
  "BN",
  "BG",
  "BF",
  "BI",
  "KH",
  "CM",
  "CA",
  "CV",
  "KY",
  "CF",
  "TD",
  "CL",
  "CN",
  "CX",
  "CC",
  "CO",
  "KM",
  "CD",
  "CG",
  "CK",
  "CR",
  "CI",
  "HR",
  "CU",
  "CW",
  "CY",
  "CZ",
  "DK",
  "DJ",
  "DM",
  "DO",
  "EC",
  "EG",
  "SV",
  "GQ",
  "ER",
  "EE",
  "SZ",
  "ET",
  "FK",
  "FO",
  "FJ",
  "FI",
  "FR",
  "GF",
  "PF",
  "TF",
  "GA",
  "GM",
  "GE",
  "DE",
  "GH",
  "GI",
  "GR",
  "GL",
  "GD",
  "GP",
  "GU",
  "GT",
  "GG",
  "GN",
  "GW",
  "GY",
  "HT",
  "HM",
  "VA",
  "HN",
  "HK",
  "HU",
  "IS",
  "IN",
  "ID",
  "IR",
  "IQ",
  "IE",
  "IM",
  "IL",
  "IT",
  "JM",
  "JP",
  "JE",
  "JO",
  "KZ",
  "KE",
  "KI",
  "KP",
  "KR",
  "KW",
  "KG",
  "LA",
  "LV",
  "LB",
  "LS",
  "LR",
  "LY",
  "LI",
  "LT",
  "LU",
  "MO",
  "MK",
  "MG",
  "MW",
  "MY",
  "MV",
  "ML",
  "MT",
  "MH",
  "MQ",
  "MR",
  "MU",
  "YT",
  "MX",
  "FM",
  "MD",
  "MC",
  "MN",
  "ME",
  "MS",
  "MA",
  "MZ",
  "MM",
  "NA",
  "NR",
  "NP",
  "NL",
  "NC",
  "NZ",
  "NI",
  "NE",
  "NG",
  "NU",
  "NF",
  "MP",
  "NO",
  "OM",
  "PK",
  "PW",
  "PS",
  "PA",
  "PG",
  "PY",
  "PE",
  "PH",
  "PN",
  "PL",
  "PT",
  "PR",
  "QA",
  "RE",
  "RO",
  "RU",
  "RW",
  "BL",
  "SH",
  "KN",
  "LC",
  "MF",
  "PM",
  "VC",
  "WS",
  "SM",
  "ST",
  "SA",
  "SN",
  "RS",
  "SC",
  "SL",
  "SG",
  "SX",
  "SK",
  "SI",
  "SB",
  "SO",
  "ZA",
  "GS",
  "SS",
  "ES",
  "LK",
  "SD",
  "SR",
  "SJ",
  "SE",
  "CH",
  "SY",
  "TW",
  "TJ",
  "TZ",
  "TH",
  "TL",
  "TG",
  "TK",
  "TO",
  "TT",
  "TN",
  "TR",
  "TM",
  "TC",
  "TV",
  "UG",
  "UA",
  "AE",
  "GB",
  "US",
  "UM",
  "UY",
  "UZ",
  "VU",
  "VE",
  "VN",
  "VG",
  "VI",
  "WF",
  "EH",
  "YE",
  "ZM",
  "ZW",
];

function getIsoCountryCodes(): string[] {
  if (typeof Intl.supportedValuesOf === "function") {
    try {
      return Intl.supportedValuesOf("region" as never);
    } catch (error) {
      console.warn("[getIsoCountryCodes] supportedValuesOf failed", error);
    }
  }
  return FALLBACK_ISO_CODES;
}

function deriveFlagFromIso(code: string): string | null {
  if (!code || code.length !== 2 || /[^A-Z]/i.test(code)) return null;
  const chars = code
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));

  try {
    return String.fromCodePoint(...chars);
  } catch (error) {
    console.warn(`[deriveFlagFromIso] Failed for code ${code}`, error);
    return null;
  }
}
