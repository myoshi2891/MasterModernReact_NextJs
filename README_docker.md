# Docker 開発環境セットアップガイド

このドキュメントでは、`docker-compose.yml` を利用した Supabase/PostgreSQL と Next.js アプリケーションのローカル開発環境構築手順を説明します。

## 概要

- Supabase/PostgreSQL 17.6.1 (`supabase/postgres:17.6.1.011`)
- Next.js 14 (Node.js 20.19.0 / CI は 20/22 を検証)
- `docker/initdb` ディレクトリで初期化スクリプトとマイグレーションを適用
- `.dockerignore` により Docker コンテキストを軽量化
- `scripts/docker-aliases.sh` でよく使う Docker コマンドのエイリアスを提供

## 前提条件

- Docker Desktop がインストールされていること
- プロジェクトルートに `.env` (および必要な `.env.local` 等) が配置されていること

## ディレクトリ構成

```text
docker-compose.yml
docker/
└── initdb/
    ├── 00_create_roles.sql
    └── 10_apply_migrations.sh
scripts/
└── docker-aliases.sh
```

## 主要ファイルの説明

- `docker-compose.yml`: `web` (Next.js) と `postgres` (Supabase/Postgres) サービスを定義。`postgres` のバージョンは Supabase 本番環境に合わせています。
- `docker/initdb/00_create_roles.sql`: Supabase が利用するロール (`anon`, `authenticated`, `service_role`) を初期作成。
- `docker/initdb/10_apply_migrations.sh`: `supabase/migrations/*.sql` を自動で適用。
- `.dockerignore`: コンテキストに送る不要ファイルを除外し、ビルド時間を短縮。
- `scripts/docker-aliases.sh`: `docker compose up` などのコマンドを短縮できるエイリアス集。

## セットアップ手順

1. 必要に応じてエイリアススクリプトを読み込みます。

   ```bash
   source scripts/docker-aliases.sh
   ```

2. コンテナを起動します。

   ```bash
   docker compose up --build
   ```

   - 初回起動時は Node.js 依存関係のインストールと Supabase マイグレーション適用が行われます。

3. ブラウザで以下にアクセスして動作を確認します。

   - Next.js: <http://localhost:3000>
   - PostgreSQL: port 54322 (例: `postgresql://postgres:<DB_PASSWORD>@localhost:54322/postgres`)

## よく使うコマンド

`scripts/docker-aliases.sh` を使用している場合の例です。

| コマンド | 説明                                               |
| -------- | -------------------------------------------------- |
| `dcu`    | `docker compose up --build`                        |
| `dcd`    | `docker compose down`                              |
| `dcl`    | `docker compose logs -f`                           |
| `dcs`    | `docker compose ps`                                |
| `dclean` | `docker system prune --volumes` (不要リソース削除) |

## 片付け

```bash
docker compose down
```

永続化ボリュームも削除する場合は、

```bash
docker compose down -v
```

## 注意事項

- `.env`、`.env.*`、`.env*.local` などの環境変数ファイルは `.dockerignore` で除外されています。環境変数は Docker Secrets や Build Args を使用して安全に管理してください。
- `supabase/migrations` 内の SQL は初回起動時に適用されます。変更を加えた場合はコンテナを再作成してください。

---

ご不明点があればお知らせください。
