#!/bin/sh
set -eu

ADMIN_PASSWORD="${SUPABASE_ADMIN_PASSWORD:-${DB_PASSWORD:-$POSTGRES_PASSWORD}}"

if [ -z "$ADMIN_PASSWORD" ]; then
  echo "Error: No password provided. Set one of: SUPABASE_ADMIN_PASSWORD, DB_PASSWORD, or POSTGRES_PASSWORD" >&2
  exit 1
fi

psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  --set=admin_password="$ADMIN_PASSWORD" <<'SQL'
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_admin') THEN
    EXECUTE format(
      'CREATE ROLE supabase_admin LOGIN SUPERUSER PASSWORD %L',
      :'admin_password'
    );
    RAISE NOTICE 'Created role supabase_admin with superuser privileges';
    RETURN;
  END IF;

  EXECUTE format(
    'ALTER ROLE supabase_admin WITH PASSWORD %L',
    :'admin_password'
  );
  RAISE NOTICE 'Updated password for existing supabase_admin role';
END
$$;
SQL

echo "[supabase-admin] Database role setup completed successfully" >&2
