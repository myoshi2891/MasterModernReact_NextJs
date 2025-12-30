/**
 * Domain types for The Wild Oasis application
 *
 * Re-exports from supabase.ts for convenience.
 * Application code should import from this file for domain types.
 */

// Re-export database types as domain types
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
  Database,
} from "./supabase";

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
export interface CabinPrice {
  /** Regular price in currency units */
  regularPrice: number;
  /** Discount amount in currency units (not percentage) */
  discount: number;
}