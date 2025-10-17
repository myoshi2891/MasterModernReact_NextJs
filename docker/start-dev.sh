#!/bin/sh
set -e

# gosuの存在チェック
check_gosu() {
  if ! command -v gosu >/dev/null 2>&1; then
    echo "WARNING: gosu is not installed in this image" >&2
    echo "Running without privilege drop (this may cause permission issues)" >&2
    return 1
  fi
  return 0
}

ensure_dir() {
  dir_path="$1"

  if [ ! -d "$dir_path" ]; then
    mkdir -p "$dir_path"
  fi

  chown -R nodeapp:nodeapp "$dir_path"
}

if [ "$(id -u)" -eq 0 ]; then
  ensure_dir /app/.next
  ensure_dir /app/node_modules

  if check_gosu; then
    exec gosu nodeapp "$@"
  else
    # gosuが利用できない場合は通常のユーザーとして実行
    echo "Attempting to continue without gosu..." >&2
    exec "$@"
  fi
fi

exec "$@"
