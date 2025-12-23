-- Ensure the core Supabase roles exist before migrations run.
CREATE ROLE IF NOT EXISTS anon NOLOGIN;
CREATE ROLE IF NOT EXISTS authenticated NOLOGIN;
CREATE ROLE IF NOT EXISTS service_role NOLOGIN;
CREATE ROLE IF NOT EXISTS postgres LOGIN SUPERUSER;

GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;
