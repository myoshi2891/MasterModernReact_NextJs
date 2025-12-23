#!/bin/sh
set -eu

ADMIN_PASSWORD="${SUPABASE_ADMIN_PASSWORD:-${DB_PASSWORD:-$POSTGRES_PASSWORD}}"

if [ -z "$ADMIN_PASSWORD" ]; then
  echo "Error: No password provided. Set one of: SUPABASE_ADMIN_PASSWORD, DB_PASSWORD, or POSTGRES_PASSWORD" >&2
  exit 1
fi

role_exists=$(psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -tAc \
  "SELECT 1 FROM pg_roles WHERE rolname = 'supabase_admin';")

if [ "$role_exists" = "1" ]; then
  psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
    --set=admin_password="$ADMIN_PASSWORD" \
    -c "ALTER ROLE supabase_admin WITH PASSWORD :'admin_password';"
  echo "Updated password for existing supabase_admin role" >&2
else
  psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
    --set=admin_password="$ADMIN_PASSWORD" \
    -c "CREATE ROLE supabase_admin LOGIN SUPERUSER PASSWORD :'admin_password';"
  echo "Created role supabase_admin with superuser privileges" >&2
fi

echo "[supabase-admin] Database role setup completed successfully" >&2
