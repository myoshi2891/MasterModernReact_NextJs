# README_supabase.md

最終更新: 2025-10-13 (Asia/Tokyo)

> 本ドキュメントは、**今日行った作業の完全ログ（実行手順・原因・対処・再発防止）**をまとめたものです。コマンドは **macOS/Unix 系** を前提に記載しています。

---

## 0. サマリー（What we accomplished）

- **警告**: Supabase の Postgres バージョン `supabase-postgres-15.8.1.121` に**未適用のセキュリティパッチ**あり → **アップグレード計画を確定**。
- **バックアップ**: `pg_dump` / `supabase db dump` による**論理バックアップ手順**を確立（SSL 必須・IPv4 固定・Pooler 経由の注意点込み）。
- **接続エラー対応**: `connection refused (IPv6)` → **IPv4 固定 + sslmode=require** で解消。Pooler/Direct の使い分け整理。
- **ゼロバイト dump 整理**: 0B の失敗バックアップを**安全に削除**するワンライナーを整備。
- **CLI 初期化**: `supabase init` の VS Code（Deno）推奨拡張について、**インストール手順**と非対話フラグを明確化。
- **db pull の停止誤認**: VS Code の PostgreSQL 拡張ログ（`ToolsService`）が原因と切り分け、**外部ターミナル + --debug** で実行する方針に。
- **履歴不一致**: `supabase db pull` で **remote history != local migrations** → `supabase migration repair --status applied <timestamp>` で整合。
- **プーラー切断エラー**: `{:client_handler_down, :session}` → **Direct(5432) + IPv4 固定** の `--db-url` で再実行し回避。
- **psql 停止誤認**: 結果表示で pager が効いていたため停止に見えた件 → **`-P pager=off`** の使い方を確立。
- **pgjwt 非対応**: PG17 で **`pgjwt` 非サポート**。依存の有無をクエリで棚卸し → **依存無し**を確認 → **`DROP EXTENSION pgjwt`** をマイグレーション化。
- **アップグレード実行方針**: Dashboard の **Infrastructure → Upgrade project**、無ければ **Pause→Restore** or **新規プロジェクトへ移行**の代替案を整理。
- **ローカル/本番のメジャー差**: 本番 PG17.6、ローカル PG15.8 → **ローカルを PG17 へ揃える指針と手順**を提示。
- **`supabase start` 失敗**: 「PG15 のデータディレクトリを PG17 で起動」問題 → **Docker volume 削除 + `.temp` 削除 → 再起動**で復旧手順を確立。

---

## 1. バックアップ戦略（必須）

### 1.1 `pg_dump`（Direct 接続 + IPv4 固定 + SSL）

```bash
# IPv4を取得（macOS）
IPV4=$(dig +short A db.<PROJECT_REF>.supabase.co | head -n1)

# Custom形式（推奨: 部分復元や検証が容易）
pg_dump   --dbname="postgresql://postgres:<PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres?sslmode=require&hostaddr=${IPV4}"   -F c --no-owner --no-acl -v   -f ./backups/supabase_$(date +%Y%m%d_%H%M).dump

# 検証（壊れていないか一覧だけ見る）
pg_restore -l ./backups/supabase_YYYYMMDD_HHMM.dump | head
```

### 1.2 Supabase CLI を使う（管理スキーマを除外してくれる）

```bash
supabase login
supabase link --project-ref <PROJECT_REF>

# スキーマのみ
supabase db dump -f supabase/schema.sql --linked

# データのみ（必要時）
supabase db dump --data-only --use-copy -f supabase/data.sql --linked
```

> 補足: Free プランはダッシュボードからバックアップ DL 不可のため、**論理バックアップの自前確保**が基本。

---

## 2. 接続トラブルと回避策

### 2.1 よくある原因

- `<PROJECT_REF>` を実値に置換していない
- **SSL 未指定**（`sslmode=require` は必須）
- **IPv6 経路問題** → `hostaddr=<IPv4>` で強制
- **Pooler の種類ミス**（Transaction Pooler はダンプ等に不向き）
- プロジェクト `Paused` / IP Allowlist / 社内 FW によるブロック

### 2.2 すぐに効くコマンド

### **Direct(5432) + IPv4 固定**

```bash
IPV4=$(dig +short A db.<PROJECT_REF>.supabase.co | head -n1)
pg_dump   --dbname="postgresql://postgres:<PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres?sslmode=require&hostaddr=${IPV4}"   -F c --no-owner --no-acl -v -f ./backup.dump
```

### **Session Pooler(5432/6543) 経由**

```bash
pg_dump   --dbname="postgresql://postgres.<PROJECT_REF>:<PASSWORD>@aws-0-<REGION>.pooler.supabase.com:6543/postgres?sslmode=require"   -F c --no-owner --no-acl -v -f ./backup_pooler.dump
```

### **疎通確認**

```bash
nc -vz db.<PROJECT_REF>.supabase.co 5432
psql "host=db.<PROJECT_REF>.supabase.co hostaddr=${IPV4} port=5432 dbname=postgres user=postgres sslmode=require" -c "select 1;"
```

---

## 3. ファイル整理（0 バイト dump の削除）

### **安全にゴミ箱へ**

```bash
find . -maxdepth 1 -type f -name '*.dump' -size 0 -print0 | xargs -0 -I{} mv -v "{}" ~/.Trash/
```

### **即時削除**

```bash
find . -maxdepth 1 -type f -name '*.dump' -size 0 -delete
```

---

## 4. `supabase init` / VS Code 設定と拡張

- 質問: 「Generate VS Code settings for Deno?」→ y/N 二択
- 非対話オプション例：

```bash
supabase init --force --with-vscode-settings     # VS Code設定を作る
# supabase init --force                           # 何も作らない
```

- 推奨拡張: **Deno** (`denoland.vscode-deno`)
  - GUI: 拡張ビュー → “WORKSPACE RECOMMENDED” → Install
  - CLI: `code --install-extension denoland.vscode-deno`

---

## 5. `supabase db pull` 系のトラブル対応

### 5.1 VS Code のログで止まって見える件

- `ToolsService … pgsql_get_*` は VS Code の PostgreSQL 拡張ログ。**外部ターミナル**で `supabase db pull --debug` 実行。

### 5.2 履歴不一致（remote != local）

```bash
# リモートの履歴を確認（pager無効）
psql "<REMOTE_DB_URL>" -P pager=off -c "SELECT version FROM supabase_migrations.schema_migrations ORDER BY version;"

# ローカルにあるのにリモートに無い → “適用済みにマーク”
supabase migration repair --status applied 20251012122122 --db-url "<REMOTE_DB_URL>"
```

### 5.3 プーラー切断 `{:client_handler_down, :session}`

- **Direct(5432) + IPv4 固定 + SSL** の `--db-url` で再実行。

### 5.4 psql が止まる誤解（pager）

```bash
psql "<REMOTE_DB_URL>" -P pager=off -c "SELECT version FROM supabase_migrations.schema_migrations ORDER BY version;"
```

---

## 6. PG17 へのアップグレード準備（`pgjwt` 非対応）

### 6.1 `pgjwt` が入っているか

```sql
SELECT * FROM pg_extension WHERE extname = 'pgjwt';
```

### 6.2 依存の棚卸し（今日の結果: **No rows returned** = 依存なし）

```sql
WITH pgjwt_funcs AS (
  SELECT p.oid
  FROM pg_proc p
  WHERE p.proname IN ('algorithm_sign','sign','try_cast_double','url_decode','url_encode','verify')
)
SELECT pg_catalog.pg_describe_object(d.classid, d.objid, 0) AS dependent_object,
       pg_catalog.pg_describe_object(d.refclassid, d.refobjid, 0) AS referenced_pgjwt_function
FROM pg_depend d
JOIN pgjwt_funcs f ON f.oid = d.refobjid
WHERE d.deptype = 'n'
ORDER BY 1;
```

### 6.3 削除（マイグレーション化推奨）

```bash
supabase migration new drop_pgjwt
# 作成された SQL に以下を記載
# DROP EXTENSION IF EXISTS pgjwt;

supabase db push --linked
# 検証
psql "<REMOTE_DB_URL>" -P pager=off -c "SELECT * FROM pg_extension WHERE extname = 'pgjwt';"
```

---

## 7. アップグレード実施パス（本番）

1. バックアップ（§1）
2. Dashboard → **Settings → Infrastructure → Upgrade project**
   - 無い場合: **Pause → Restore**（Free）/ **新規プロジェクトへ dump/restore**
3. アプリ簡易 E2E / `select version();` で確認
4. 履歴ずれが出たら `migration repair` で整合

---

## 8. ローカルと本番のバージョン差

- 本番: **PostgreSQL 17.6 (aarch64)**
- ローカル: **PostgreSQL 15.8 (x86_64)** → **PG17 へ揃えるのが理想**

### 8.1 ローカルを PG17 に揃える（Supabase CLI ローカル）

```bash
supabase stop || true
rm -rf supabase/.temp         # 重要: 古いPGで初期化済みの痕跡を削除
# （必要に応じて）config.toml の db.major_version を 17 に
supabase start --debug

# 再構築
supabase db reset   # 破壊的: migrationsを全適用
# or
supabase db push
```

---

## 9. `supabase start` 失敗（PG15 データを PG17 で起動しようとした）

**症状ログ**:

```text
FATAL:  database files are incompatible with server
DETAIL: The data directory was initialized by PostgreSQL version 15, which is not compatible with this version 17.6.
```

### **解決（破壊的: ローカル DB 消去）**

```bash
supabase stop || true
# プロジェクトのボリュームを特定して削除
docker volume ls | grep -i <ProjectName or supabase_db>
docker volume rm <該当volumeを全部>

# CLIの一時データも削除
rm -rf supabase/.temp

# 再起動 → バージョン確認 → migrations 適用
supabase start --debug
psql -P pager=off -c 'select version();' "postgresql://postgres:postgres@localhost:54322/postgres"
supabase db reset   # or db push
```

### **データ救出が必要な場合（任意）**

```bash
# volume名を指定して一時的にPG15で起動 → dump取得 → その後 volume削除
docker run --rm --name temp-pg15 -e POSTGRES_PASSWORD=postgres -p 5555:5432   -v <該当volume>:/var/lib/postgresql/data   public.ecr.aws/supabase/postgres:15.8.1.121

# 別ターミナルで
pg_dump "postgresql://postgres:postgres@localhost:5555/postgres" -F c --no-owner --no-acl -f ./local_pg15_backup.dump
```

---

## 10. 付録：便利ワンライナー

### **psql（pager 無効・CSV 風）**

```bash
psql "<DB_URL>" -At -F, -P pager=off -c "select version();"
```

### **ゼロバイト dump だけゴミ箱へ**

```bash
find . -maxdepth 1 -type f -name '*.dump' -size 0 -print0 | xargs -0 -I{} mv -v "{}" ~/.Trash/
```

### **Pooler での接続例**

```bash
psql "postgresql://postgres.<PROJECT_REF>:<PASSWORD>@aws-0-<REGION>.pooler.supabase.com:6543/postgres?sslmode=require" -c "select 1;"
```

---

## 11. 次の一手（明日以降）

- 本番：`pgjwt` 削除済みを確認 → **PG17 アップグレード実行**
- ローカル：**PG17 で安定起動**できたら `db diff/push` のラウンドトリップ確認
- CI/CD：`SUPABASE_DB_PASSWORD` や `PROJECT_ID` を Secrets で再確認、`db push --linked` の定期運用化

---
