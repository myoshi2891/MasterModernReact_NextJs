#!/bin/sh
set -eu

: "${POSTGRES_USER:=postgres}"
: "${POSTGRES_DB:=postgres}"
: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD must be set for healthcheck}"

PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-5432}"

export PGPASSWORD="$POSTGRES_PASSWORD"

psql \
  --host "$PGHOST" \
  --port "$PGPORT" \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" \
  --tuples-only \
  --no-align \
  --command "SELECT 1;" >/dev/null
