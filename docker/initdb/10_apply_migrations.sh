#!/bin/sh
set -eu

MIGRATIONS_DIR="/docker-entrypoint-initdb.d/migrations"

if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "No migrations directory found at $MIGRATIONS_DIR, skipping."
  exit 0
fi

for file in $(find "$MIGRATIONS_DIR" -maxdepth 1 -name "*.sql" | sort); do
  [ -f "$file" ] || continue
  echo "Applying migration: $(basename "$file")"
  psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" --file "$file"
done
