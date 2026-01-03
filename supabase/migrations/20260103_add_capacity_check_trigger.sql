-- Migration: Add capacity check trigger for bookings
-- Date: 2026-01-03
-- Description: Ensures numGuests does not exceed cabin's maxCapacity
--
-- Related: specs/002-booking-concurrency-control/spec.md
-- Error codes:
--   - P0001 with message 'CAPACITY_EXCEEDED': numGuests > maxCapacity
--   - P0001 with message 'CABIN_NOT_FOUND': cabinId does not exist in cabins table

-- Create the trigger function
CREATE OR REPLACE FUNCTION check_booking_capacity()
RETURNS trigger AS $$
DECLARE
  max_cap int;
BEGIN
  -- Get maxCapacity from cabins table
  SELECT "maxCapacity" INTO max_cap
  FROM cabins
  WHERE id = NEW."cabinId";

  -- Check if cabin exists
  IF max_cap IS NULL THEN
    RAISE EXCEPTION USING
      ERRCODE = 'P0001',
      MESSAGE = 'CABIN_NOT_FOUND';
  END IF;

  -- Check if numGuests exceeds capacity
  IF NEW."numGuests" > max_cap THEN
    RAISE EXCEPTION USING
      ERRCODE = 'P0001',
      MESSAGE = 'CAPACITY_EXCEEDED';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger (drop if exists for idempotency)
DROP TRIGGER IF EXISTS bookings_capacity_check ON bookings;

-- Trigger fires on INSERT (always) and UPDATE (only when numGuests or cabinId changes)
CREATE TRIGGER bookings_capacity_check
  BEFORE INSERT OR UPDATE OF "numGuests", "cabinId" ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_booking_capacity();

-- Verification query (run after migration to confirm trigger exists)
-- SELECT tgname, tgtype FROM pg_trigger WHERE tgrelid = 'bookings'::regclass;