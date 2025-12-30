/**
 * Supabase Database Types
 *
 * Note: These types are manually defined based on the existing data-service.js.
 * When Supabase CLI is available, regenerate with:
 *   supabase gen types typescript --linked > types/supabase.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/** Booking status enum - single source of truth */
export type BookingStatus = "unconfirmed" | "checked-in" | "checked-out";

export interface Database {
  public: {
    Tables: {
      cabins: {
        Row: {
          id: number;
          created_at: string;
          name: string;
          maxCapacity: number;
          regularPrice: number;
          discount: number;
          description: string | null;
          image: string | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          name: string;
          maxCapacity: number;
          regularPrice: number;
          discount?: number;
          description?: string | null;
          image?: string | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          name?: string;
          maxCapacity?: number;
          regularPrice?: number;
          discount?: number;
          description?: string | null;
          image?: string | null;
        };
      };
      bookings: {
        Row: {
          id: number;
          created_at: string;
          startDate: string;
          endDate: string;
          numNights: number;
          numGuests: number;
          cabinPrice: number;
          extrasPrice: number;
          totalPrice: number;
          status: BookingStatus;
          hasBreakfast: boolean;
          isPaid: boolean;
          observations: string | null;
          cabinId: number;
          guestId: number;
        };
        Insert: {
          id?: number;
          created_at?: string;
          startDate: string;
          endDate: string;
          numNights: number;
          numGuests: number;
          cabinPrice: number;
          extrasPrice?: number;
          totalPrice: number;
          status?: BookingStatus;
          hasBreakfast?: boolean;
          isPaid?: boolean;
          observations?: string | null;
          cabinId: number;
          guestId: number;
        };
        Update: {
          id?: number;
          created_at?: string;
          startDate?: string;
          endDate?: string;
          numNights?: number;
          numGuests?: number;
          cabinPrice?: number;
          extrasPrice?: number;
          totalPrice?: number;
          status?: BookingStatus;
          hasBreakfast?: boolean;
          isPaid?: boolean;
          observations?: string | null;
          cabinId?: number;
          guestId?: number;
        };
      };
      guests: {
        Row: {
          id: number;
          created_at: string;
          fullName: string;
          email: string;
          nationalID: string | null;
          nationality: string | null;
          countryFlag: string | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          fullName: string;
          email: string;
          nationalID?: string | null;
          nationality?: string | null;
          countryFlag?: string | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          fullName?: string;
          email?: string;
          nationalID?: string | null;
          nationality?: string | null;
          countryFlag?: string | null;
        };
      };
      settings: {
        Row: {
          id: number;
          created_at: string;
          minBookingLength: number;
          maxBookingLength: number;
          maxGuestsPerBooking: number;
          breakfastPrice: number;
        };
        Insert: {
          id?: number;
          created_at?: string;
          minBookingLength: number;
          maxBookingLength: number;
          maxGuestsPerBooking: number;
          breakfastPrice: number;
        };
        Update: {
          id?: number;
          created_at?: string;
          minBookingLength?: number;
          maxBookingLength?: number;
          maxGuestsPerBooking?: number;
          breakfastPrice?: number;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      booking_status: BookingStatus;
    };
  };
}

// Convenience types for table rows
export type Cabin = Database["public"]["Tables"]["cabins"]["Row"];
export type CabinInsert = Database["public"]["Tables"]["cabins"]["Insert"];
export type CabinUpdate = Database["public"]["Tables"]["cabins"]["Update"];

export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type BookingInsert = Database["public"]["Tables"]["bookings"]["Insert"];
export type BookingUpdate = Database["public"]["Tables"]["bookings"]["Update"];

export type Guest = Database["public"]["Tables"]["guests"]["Row"];
export type GuestInsert = Database["public"]["Tables"]["guests"]["Insert"];
export type GuestUpdate = Database["public"]["Tables"]["guests"]["Update"];

export type Settings = Database["public"]["Tables"]["settings"]["Row"];
export type SettingsInsert = Database["public"]["Tables"]["settings"]["Insert"];
export type SettingsUpdate = Database["public"]["Tables"]["settings"]["Update"];

// Booking with joined cabin data (commonly used in getBookings)
export type BookingWithCabin = Booking & {
  cabins: Pick<Cabin, "name" | "image" | "maxCapacity">;
};