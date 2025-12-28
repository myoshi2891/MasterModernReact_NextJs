# 2025-10-13 作業メモ

## 1. Postgres ボリューム初期化エラー調査と対応

- `docker compose up --build` 時に `data directory has wrong ownership` が発生したため、`mastermodernreact_nextjs_postgres-data` ボリュームを調査。
- BusyBox コンテナで `chown -R 70:70 /var/lib/postgresql/data` を実施しても改善せず、Supabase イメージの `postgres` UID/GID が `101:102` であることを確認。
- `chown -R 101:102 /var/lib/postgresql/data` と `chmod 700 /var/lib/postgresql/data /var/lib/postgresql/data/pgdata` を実施。
- ボリューム内に `pgdata` サブディレクトリが存在し、`PG_VERSION` が親ディレクトリに無いことを確認。`pgdata` 配下のデータを `/var/lib/postgresql/data` 直下へ移動し、`pgdata` を削除。
- `docker-compose.yml` の `PGDATA` を `/var/lib/postgresql/data` に修正し、再起動でエラー解消。

## 2. タイムゾーン設定

- `docker-compose.yml` に `TZ: Asia/Tokyo` を追加。
- `docker/initdb/05_set_timezone.sql` を作成し、`ALTER SYSTEM SET timezone = 'Asia/Tokyo'; SELECT pg_reload_conf();` を追加。

## 3. 環境変数と Next.js 側設定

- `.env` と `.env.local` の `POSTGRES_USER` を `postgres` に変更。
- `docker-compose.yml` の `web` サービスで `DATABASE_URL` に `?options=-c%20TimeZone=Asia/Tokyo` を追加してアプリ側のタイムゾーンも合わせた。
- `docker-compose.yml` の `postgres` サービスにおいて、`POSTGRES_USER` を環境変数参照からリテラル `postgres` に固定。

## 4. コンテナ再生成と認証エラー対応

- `docker compose down` → `docker compose up --build`（必要に応じて `--force-recreate`）を繰り返し、更新した環境変数と設定を反映。
- `docker inspect` と `docker exec env` でコンテナ内の `POSTGRES_USER=postgres` を確認。
- `supabase_map` に存在しないユーザーで peer 認証しようとするログを解消するため、環境変数の修正後に古いユーザー名を使うヘルスチェックを更新 (`pg_isready -U postgres`)。
- 既存データベースに `postgres` ロールが無かったため、`psql` で `CREATE ROLE postgres WITH LOGIN SUPERUSER PASSWORD '<PASSWORD>';` を実行。
- `docker compose logs postgres` で `peer authentication failed` ログが出ていないことを確認。

## 5. 動作確認

- `docker compose ps` で `postgres` コンテナが `healthy` であることを確認。
- 必要に応じて `SHOW timezone;` や `SELECT now();` を実行し、`Asia/Tokyo` が反映されていることを確認。

## 6. 留意点

- 環境変数を変更した際は必ず `docker compose down` でコンテナを削除してから `docker compose up --build`（または `up -d --force-recreate`）で再生成すること。
- 既存データを保持する場合は所有権とパーミッション (`chown`, `chmod`) を再確認し、`PG_VERSION` を含めたファイル構成が `PGDATA` の期待と一致しているかをチェックする。
