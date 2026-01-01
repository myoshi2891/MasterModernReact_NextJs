-- Migration: Add idempotency key for duplicate request prevention
-- Date: 2026-01-01
-- Description: Adds clientRequestId column to bookings table with unique constraint

-- Add nullable UUID column for idempotency key
ALTER TABLE bookings
ADD COLUMN "clientRequestId" uuid;

-- Create partial unique index (only for non-null values)
-- This allows existing records without clientRequestId while preventing duplicates
CREATE UNIQUE INDEX bookings_client_request_id_unique
ON bookings ("clientRequestId")
WHERE "clientRequestId" IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN bookings."clientRequestId" IS 'Client-generated UUID for idempotency. Prevents duplicate bookings from double-clicks or network retries.';

-- ============================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- ============================================================
-- To revert this migration, run the following commands:
--
-- DROP INDEX IF EXISTS bookings_client_request_id_unique;
-- ALTER TABLE bookings DROP COLUMN IF EXISTS "clientRequestId";
--
-- Note: Rollback is safe and does not affect existing booking data.
-- ============================================================