/**
 * Domain types for The Wild Oasis application
 *
 * Re-exports from supabase.ts for convenience.
 * Application code should import from this file for domain types.
 */

// Re-export database row types as domain types
export type {
  Cabin,
  CabinInsert,
  CabinUpdate,
  Booking,
  BookingInsert,
  BookingUpdate,
  Guest,
  GuestInsert,
  GuestUpdate,
  Settings,
  SettingsInsert,
  SettingsUpdate,
  BookingWithCabin,
} from "./supabase";

// Re-export the Database type for Supabase client typing
export type { Database } from "./supabase";

/**
 * Country data from REST Countries API
 */
export interface Country {
  name: string;
  flag: string;
}

/**
 * Date range for reservations
 */
export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

/**
 * Cabin price info (subset used by getCabinPrice)
 */
export type CabinPrice = {
  regularPrice: number;
  discount: number;
};