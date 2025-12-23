#!/bin/sh
set -eu

TZ_VALUE="${TZ:-Asia/Tokyo}"

psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -v tz="$TZ_VALUE" <<'SQL'
ALTER SYSTEM SET timezone = :'tz';
SELECT pg_reload_conf();
SQL
