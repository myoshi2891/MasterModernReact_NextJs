-- Rollback: Remove capacity check trigger
-- Date: 2026-01-03
-- Use this script to rollback the capacity check trigger if needed

-- Drop the trigger
DROP TRIGGER IF EXISTS bookings_capacity_check ON bookings;

-- Drop the function
DROP FUNCTION IF EXISTS check_booking_capacity();

-- Verification query (run after rollback to confirm removal)
-- SELECT tgname FROM pg_trigger WHERE tgrelid = 'bookings'::regclass;