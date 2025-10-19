#!/usr/bin/env bash
set -euo pipefail

# rootで来たら nodeapp に降格
if [ "$(id -u)" = "0" ]; then
  chown -R nodeapp:nodeapp /app || true
  exec gosu nodeapp "$0" "$@"
fi

# node_modules (named volume) が空なら焼き込みから一度だけコピー
if [ ! -d /app/node_modules ] || [ -z "$(ls -A /app/node_modules 2>/dev/null || true)" ]; then
  cp -a /opt/node_modules.baked/. /app/node_modules/
fi

# compose が与えたコマンドを実行
exec "$@"
