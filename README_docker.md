# Docker 開発環境セットアップガイド

このドキュメントでは、`docker-compose.yml` を利用した Supabase/PostgreSQL と Next.js アプリケーションのローカル開発環境構築手順を説明します。

## 概要

- Supabase/PostgreSQL 17.6.1 (`supabase/postgres:17.6.1.011`)
- Next.js 14 (Node.js 20.19.0)
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

# Dockerfile について詳しく解説

## 全体構成

これは**Node.js 開発環境用の Dockerfile**で、特に Next.js アプリケーションの開発に最適化されています。セキュリティとパフォーマンスの両立を重視した設計になっています。

---

## 各行の詳細解説

### 1. `# syntax=docker/dockerfile:1.7`

```dockerfile
# syntax=docker/dockerfile:1.7
```

**BuildKit の構文バージョン指定**です。

- Docker BuildKit の機能を有効化
- バージョン 1.7 の構文を使用することを明示
- より高度なキャッシング、並列ビルド、セキュリティ機能が利用可能に
- `#`で始まっていますがコメントではなく、特殊なディレクティブ

---

### 2. `FROM node:20.19.0-bullseye`

```dockerfile
FROM node:20.19.0-bullseye
```

**ベースイメージの選択**:

- Node.js 20.19.0 を使用
- Debian 11 (Bullseye)ベース
- **バージョン固定の重要性**: `20`だけでなく`20.19.0`と完全指定することで、再現性を確保
- Bullseye: 安定版 Debian で、本番環境でも安心して使える

---

### 3. `WORKDIR /app`

```dockerfile
WORKDIR /app
```

**作業ディレクトリの設定**:

- 以降のコマンドは全て`/app`で実行される
- ディレクトリが存在しない場合は自動作成
- コンテナ内のアプリケーションコードの配置場所

---

### 4. システムパッケージのインストール

```dockerfile
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends gosu \
  && rm -rf /var/lib/apt/lists/*
```

**重要なポイント**:

- **`gosu`**: root から非 root ユーザーへ安全に権限を降格するツール

  - `su`や`sudo`より軽量で安全
  - PID の問題を回避できる

- **`--no-install-recommends`**: 推奨パッケージをインストールしない

  - イメージサイズを最小化

- **`rm -rf /var/lib/apt/lists/*`**: パッケージリストのキャッシュを削除

  - イメージサイズを削減(数十 MB 削減可能)

- **`&&`でコマンド連結**: レイヤー数を減らし、イメージサイズを最適化

---

### 5. 依存関係のインストール

```dockerfile
COPY package*.json ./
RUN npm ci
```

**キャッシュ戦略の最適化**:

- **なぜ先に package.json だけコピー?**

  - Docker のレイヤーキャッシュを最大限活用
  - ソースコードが変更されても package.json が変わらなければ、`npm ci`はキャッシュから実行される

- **`npm ci` vs `npm install`**:
  - `npm ci`: クリーンインストール、package-lock.json を厳密に守る
  - より高速で、CI/CD 環境に最適
  - `node_modules`を削除してからインストール

---

### 6. node_modules のベイク(焼き込み)

```dockerfile
RUN cp -a node_modules /opt/node_modules.baked
```

**パフォーマンス最適化の技法**:

- **初回起動の高速化**:

  - コンテナ起動時に参照用の node_modules をコピー元として使用
  - ボリュームマウントで空になった node_modules を即座に復元可能

- **`cp -a`**: アーカイブモードでコピー

  - パーミッション、タイムスタンプ、シンボリックリンクを保持

- **開発環境での利点**:
  - ホストの node_modules を使いたくない場合に有効
  - Docker volume 使用時の初回同期待ち時間を短縮

---

### 7. 非 root ユーザーの作成

```dockerfile
RUN groupadd -r nodeapp --gid=1001 \
  && useradd -r -g nodeapp --uid=1001 --create-home --home-dir /home/nodeapp --shell /bin/bash nodeapp \
  && mkdir -p /home/nodeapp \
  && chown -R nodeapp:nodeapp /home/nodeapp /app /opt/node_modules.baked
```

**セキュリティのベストプラクティス**:

- **`-r`**: システムアカウント(通常ログイン不可)
- **GID/UID=1001**: 固定 ID で、ホストとのパーミッション問題を回避
- **`--create-home`**: ホームディレクトリを作成
  - Next.js/SWC がキャッシュディレクトリとして使用
- **`--shell /bin/bash`**: デバッグ時のシェルアクセス用
- **`chown -R`**: 必要なディレクトリの所有権を変更
  - `/app`: アプリケーションコード
  - `/opt/node_modules.baked`: 焼き込んだ node_modules
  - `/home/nodeapp`: ホームディレクトリ

**なぜ非 root ユーザーが必要?**

- コンテナが侵害された際の被害を最小化
- 本番環境のセキュリティ要件に対応
- ホストファイルシステムへの不正アクセスを防止

---

### 8. 環境変数の設定

```dockerfile
ENV HOME=/home/nodeapp
ENV PORT=3000
```

**環境変数の意味**:

- **`HOME`**:

  - Next.js や SWC(Speedy Web Compiler)がキャッシュを保存する場所
  - 明示的に指定しないと、root のホームを参照してエラーになる可能性

- **`PORT`**:
  - アプリケーションがリッスンするポート番号
  - Next.js のデフォルトポート

---

### 9. ポートの公開

```dockerfile
EXPOSE 3000
```

**ドキュメント的な役割**:

- コンテナが 3000 番ポートを使用することを明示
- 実際のポート公開は`docker run -p`で行う
- チーム開発での可読性向上

---

### 10. エントリポイントスクリプト

```dockerfile
COPY docker/start-dev.sh /usr/local/bin/start-dev.sh
RUN chmod +x /usr/local/bin/start-dev.sh
ENTRYPOINT ["start-dev.sh"]
```

**起動プロセスのカスタマイズ**:

- **エントリポイントスクリプトの役割** (コメントから推測):

  1. **権限降格**: gosu を使って nodeapp ユーザーで実行
  2. **node_modules ウォームアップ**: ベイクした node_modules をコピー
  3. **初回同期待ち**: ボリュームマウントの準備完了を待機

- **`/usr/local/bin/`**: 標準的なカスタムスクリプトの配置場所
- **`chmod +x`**: 実行権限の付与
- **`ENTRYPOINT`**: コンテナ起動時に必ず実行されるコマンド
  - `CMD`との違い: 上書きされにくい

---

## アーキテクチャ上の優れた設計ポイント

### 1. **マルチレイヤーキャッシュ戦略**

```text
package.json → npm ci → ソースコード
```

依存関係の変更が少ない場合、ビルドが劇的に高速化

### 2. **セキュリティレイヤー**

- 非 root ユーザー実行
- gosu による安全な権限降格
- 最小限のパッケージインストール

### 3. **開発体験の最適化**

- node_modules のベイクによる高速起動
- ホームディレクトリの明示で Next.js 最適化
- ボリュームマウント対応

### 4. **再現性と保守性**

- バージョン完全固定
- BuildKit 構文の明示
- UID/GID 固定によるパーミッション問題回避

---

## 想定される使用シナリオ

この Dockerfile は以下のような docker-compose.yml と組み合わせて使用されると推測されます:

```yaml
services:
  app:
    build: .
    volumes:
      - .:/app # ホットリロード用
      - node_modules:/app/node_modules # named volume
    ports:
      - "3000:3000"
```

これにより、コード変更が即座に反映される開発環境が構築できます。

---

この Dockerfile は、**セキュリティ、パフォーマンス、開発体験**のバランスが非常によく取れた、プロダクション品質の設計になっています。

# start-dev.sh とマルチステージ Dockerfile、そして docker-compose 構成について解説

---

## 1. start-dev.sh の詳細解説

```bash
#!/usr/bin/env bash
set -euo pipefail
```

## シバン行とエラーハンドリング

### `#!/usr/bin/env bash`

- **ポータビリティ重視**: `/bin/bash`直接指定より柔軟
- `env`経由で bash を探すため、異なるシステムでも動作

### `set -euo pipefail`

**Bash のストリクトモード**（本番品質スクリプトの必須設定）:

- **`-e`**: コマンドが失敗したら即座にスクリプト終了

  - 例: `cp`が失敗したら後続処理を実行しない

- **`-u`**: 未定義変数の参照をエラーとする

  - タイポによるバグを防止

- **`-o pipefail`**: パイプライン全体の失敗を検知
  - 例: `cat file | grep pattern`で`cat`が失敗しても検知できる

---

※「シバン行」または「シェバン行」（Shebang line）とは、**Unix 系 OS（Linux, macOS など）のスクリプトファイルの先頭行に記述する、そのスクリプトを実行するためのインタプリタ（解釈・実行プログラム）を指定する特別な行**のことです。

シバンは、記号の\*\*`#`**（シャープ、ハッシュ）と**`!`**（エクスクラメーションマーク、バン）を組み合わせた**`#!`\*\*で始まることから、「**Hashbang**（ハッシュバン）」が転じて「**Shebang**（シバン、シェバン）」と呼ばれるようになりました。

---

## 💻 シバン行の基本的な形式と役割

### 1\. 形式

シバン行は、ファイルの**1 行目**に、以下の形式で記述する必要があります。

```bash
#! /path/to/interpreter [オプション]
```

- **`#!`**: シバン行であることを示すマジックナンバーです。
- **`/path/to/interpreter`**: スクリプトを実行するインタプリタ（プログラム）の**絶対パス**を指定します。
- **`[オプション]`**: インタプリタに渡すオプションを 1 つだけ指定できます。（移植性の観点から、通常は省略されます）

### 2\. 役割（何のために使うのか）

Unix 系 OS で、`./script.sh` のようにファイル名を直接指定してスクリプトを実行しようとしたとき、OS のカーネル（プログラムローダー）はファイルの**先頭 1 行目**を見て、このファイルがどのプログラムで実行されるべきかを判断します。

| シバン行がある場合                                                                      | シバン行がない場合                                                                           |
| :-------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------- |
| **`#!`に続くパス（例: `/bin/bash`）で指定されたインタプリタ**がスクリプトを実行します。 | スクリプトを実行しようとした**親シェル**（カレントシェル）がスクリプトを実行します。         |
| **明確な実行環境**を指定できます。                                                      | 実行環境（シェル）がユーザーによって異なる場合があり、意図しない挙動になる可能性があります。 |

### 3\. 具体的な記述例

| 目的のスクリプト      | シバン行の例         | 意味                                                                      |
| :-------------------- | :------------------- | :------------------------------------------------------------------------ |
| **Bash スクリプト**   | `#!/bin/bash`        | スクリプトを**Bash シェル**で実行する。                                   |
| **Python スクリプト** | `#!/usr/bin/python3` | スクリプトを`/usr/bin/python3`にある**Python 3 インタプリタ**で実行する。 |
| **Perl スクリプト**   | `#!/usr/bin/perl`    | スクリプトを**Perl インタプリタ**で実行する。                             |

---

## 🔑 移植性の高いシバン行の記述方法

インタプリタの絶対パス（例: `/bin/bash` や `/usr/bin/python3`）は、OS や Linux ディストリビューションによって場所が異なる場合があります。この問題を解決し、**より移植性を高める**ために、**`env`コマンド**を利用する方法が推奨されます。

### `#!/usr/bin/env` の利用

```bash
#!/usr/bin/env python3
```

1. OS はまず\*\*`/usr/bin/env`\*\*というプログラムを実行します。
2. `env`プログラムは、引数で与えられた`python3`を\*\*環境変数`PATH`\*\*から探し出します。
3. 最初に見つかった`python3`のインタプリタでスクリプトを実行します。

これにより、Python のパスが`/usr/local/bin/python3`など、環境によって異なっていても、スクリプトの先頭行を変更することなく動作させることができます。

---

## 💡 シバン行の動作に関する注意点

### 1\. 実行権限

シバン行が機能し、スクリプトをファイル名だけで直接実行できるようにするためには、スクリプトファイルに**実行権限**を与える必要があります。

```bash
chmod +x script_name.sh
```

### 2\. コメント扱い

シバン行（`#!`から始まる行）は、多くのスクリプト言語において**コメント**（`#`がコメントアウトの記号）として扱われるため、スクリプト本体の処理には影響を与えません。これにより、OS がインタプリタを指定するために使用した後、インタプリタ側では単なるコメントとして無視されます。

### 3\. 必須ではないケース

- **インタプリタを明示的に指定して実行する場合**:
  `bash script.sh` や `python3 script.py` のように、実行時にインタプリタを直接指定する場合、シバン行は無視されます。（この場合、親シェルではなく明示的に指定したインタプリタで実行されます）。
- **モジュールとしてインポートされるファイル**:
  関数やクラスの定義だけで、直接実行されないモジュールファイルには、シバン行は不要です。

## 権限降格ロジック

```bash
if [ "$(id -u)" = "0" ]; then
  mkdir -p /home/nodeapp
  chown -R nodeapp:nodeapp /home/nodeapp /app || true
  exec gosu nodeapp "$0" "$@"
fi
```

### なぜこの設計が優れているか

**問題**: Docker コンテナは通常 root で起動される

**解決策**:

1. **root で起動されたことを検知**: `id -u`が 0 なら root
2. **環境を整備**: ホームディレクトリとパーミッション設定
3. **安全に降格**: `gosu`で非 root ユーザーに切り替え
4. **再帰呼び出し**: `exec gosu nodeapp "$0" "$@"`で自分自身を再実行

### 技術的詳細

#### `chown -R nodeapp:nodeapp /home/nodeapp /app || true`

- **`|| true`**: chown が失敗しても続行
  - 理由: 既に正しい権限の場合や、一部ファイルが書き込み不可の場合でもスクリプトを止めない
  - **開発体験の向上**: 些細なパーミッション問題でコンテナ起動失敗を防ぐ

#### `exec gosu nodeapp "$0" "$@"`

- **`exec`**: 現在のシェルプロセスを置き換える

  - PID 1 を維持（Docker のシグナル処理で重要）
  - メモリ効率が良い

- **`"$0"`**: スクリプト自身のパス
- **`"$@"`**: 全ての引数を展開（`npm run dev`など）

**実行フロー**:

```
[root] start-dev.sh npm run dev
  ↓ 降格
[nodeapp] start-dev.sh npm run dev
  ↓ 次の処理へ
```

---

## node_modules ウォームアップ

```bash
if [ ! -d /app/node_modules ] || [ -z "$(ls -A /app/node_modules 2>/dev/null || true)" ]; then
  cp -a /opt/node_modules.baked/. /app/node_modules/
fi
```

### 条件分岐の詳細

**2 つの条件を OR 接続**:

#### 条件 1: `[ ! -d /app/node_modules ]`

- node_modules ディレクトリが存在しない場合

#### 条件 2: `[ -z "$(ls -A /app/node_modules 2>/dev/null || true)" ]`

複雑だが重要な条件:

- **`ls -A`**: 隠しファイルを含む全ファイルをリスト
- **`2>/dev/null`**: エラー出力を捨てる（ディレクトリが無い場合のエラー回避）
- **`|| true`**: ls が失敗してもスクリプト継続（`set -e`対策）
- **`[ -z "..." ]`**: 出力が空文字列（=空ディレクトリ）なら真

### なぜこの処理が必要か

**シナリオ**: Docker named volume を使う場合

```yaml
volumes:
  - web-node-modules:/app/node_modules
```

1. **初回起動**: named volume は空
2. **問題**: `npm run dev`が「依存関係が無い」とエラー
3. **解決**: 焼き込んだ node_modules をコピー
4. **2 回目以降**: volume に既にあるのでスキップ（高速）

### コピーの技法

```bash
cp -a /opt/node_modules.baked/. /app/node_modules/
```

- **`-a`**: アーカイブモード（パーミッション、リンク、タイムスタンプ保持）
- **`/.`**: ドットで終わることで、**ディレクトリの中身をコピー**
  - `/opt/node_modules.baked` → `/app/node_modules/node_modules`（誤り）
  - `/opt/node_modules.baked/.` → `/app/node_modules/`（正解）

---

## 同期待ちロジック

```bash
WAIT_SECS=60
i=0
while [ $i -lt $WAIT_SECS ]; do
  if [ -d /app/app ] || [ -d /app/pages ]; then
    break
  fi
  sleep 1
  i=$((i+1))
done
```

### なぜこの処理が必要か２

**問題**: Docker Compose watch の**レースコンディション**

```text
タイムライン:
T=0s  : コンテナ起動、start-dev.sh実行開始
T=0.1s: npm run dev 開始 → /app が空 → エラー
T=1s  : compose watch が同期完了
```

**解決**: アプリケーションコードが同期されるまで待機

### 技術的詳細

#### ループロジック

```bash
while [ $i -lt $WAIT_SECS ]; do
```

- 最大 60 秒待機
- **タイムアウト設定**: 無限ループを防ぐ（重要なフェイルセーフ）

#### 検出条件

```bash
if [ -d /app/app ] || [ -d /app/pages ]; then
```

**Next.js の構造を検知**:

- **App Router**: `/app/app`ディレクトリ
- **Pages Router**: `/app/pages`ディレクトリ
- どちらか一方が存在すれば Next.js プロジェクトとして有効

#### スリープとインクリメント

```bash
sleep 1
i=$((i+1))
```

- 1 秒ごとにチェック
- **CPU に優しい**: busy wait を回避

### タイムアウト後の挙動

```bash
# ループ終了後、何もしない
exec "$@"  # そのまま実行
```

**設計判断**:

- タイムアウト時にエラーで止めない
- **理由**:
  - 特殊なディレクトリ構造かもしれない
  - 開発者が意図的に空で起動しているかもしれない
  - 失敗は後続の npm run dev で分かる

---

## コマンド実行

```bash
exec "$@"
```

### 引数展開の詳細

**docker-compose.yml から渡される**:

```yaml
command: ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]
```

**start-dev.sh への引数**:

```
$0 = /usr/local/bin/start-dev.sh
$1 = npm
$2 = run
$3 = dev
$4 = --
$5 = --hostname
$6 = 0.0.0.0
$7 = --port
$8 = 3000
```

**`"$@"`の展開**:

```bash
exec npm run dev -- --hostname 0.0.0.0 --port 3000
```

### なぜ`exec`を使うか

**PID 1 問題の解決**:

```
exec なし:
PID 1: bash (start-dev.sh)
  └─ PID 123: npm run dev

exec あり:
PID 1: npm run dev
```

**メリット**:

1. **シグナル処理**: `docker stop`の SIGTERM が npm に直接届く
2. **グレースフルシャットダウン**: Next.js が正常終了できる
3. **ゾンビプロセス回避**: bash が残らない

---

## 2. マルチステージ Dockerfile の解説

## 全体アーキテクチャ

```text
dev-base (開発用)
    ↓
prod-build (ビルド専用)
    ↓
prod-runtime (本番最小)
```

---

## Stage 1: dev-base（開発環境）

```dockerfile
FROM node:20.19.0-bullseye AS dev-base
```

### 設計思想

- **開発体験重視**: ホットリロード、デバッグツール完備
- **セキュリティも考慮**: 非 root ユーザー実行
- **再利用可能**: `AS dev-base`で後続ステージから参照可能

#### **前述の解説と同じ内容を含むため省略**

---

## Stage 2: prod-build（ビルド環境）

```dockerfile
FROM node:20.19.0-bullseye AS prod-build
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
```

### なぜ独立したビルドステージが必要か

**問題**: 本番イメージに devDependencies を含めたくない

**解決**:

1. **ビルド専用環境**: 全依存関係を含む
2. **ビルド実行**: Next.js の最適化ビルド
3. **成果物のみ抽出**: 次のステージで必要なファイルだけコピー

### ビルドプロセス

#### `npm ci`

- **クリーンインストール**: package-lock.json を厳密に守る
- **devDependencies 込み**: TypeScript、ESLint 等が必要

#### `COPY . .`

- 全ソースコードをコピー
- `.dockerignore`で不要なファイルを除外

#### `npm run build`

**Next.js ビルドの内容**:

- TypeScript のコンパイル
- ページの静的生成（SSG）
- 最適化とバンドリング
- `.next`ディレクトリに出力

### ビルド時環境変数（コメント部分）

```dockerfile
# ARG NEXT_PUBLIC_API_URL
# ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
```

**重要な設計判断**:

- **`NEXT_PUBLIC_*`変数**: ビルド時にクライアントコードに埋め込まれる
- **必要に応じて有効化**:

  ```bash
  docker build --build-arg NEXT_PUBLIC_API_URL=https://api.example.com
  ```

---

## Stage 3: prod-runtime（本番実行環境）

```dockerfile
FROM node:20.19.0-bullseye AS prod-runtime
WORKDIR /app
```

### 最小化戦略

**目標**: 実行に必要な最小限のファイルのみ

```dockerfile
RUN groupadd -r nodeapp --gid=1001 \
  && useradd -r -g nodeapp --uid=1001 --create-home --home-dir /home/nodeapp --shell /bin/bash nodeapp
ENV HOME=/home/nodeapp
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
```

#### `NODE_ENV=production`の重要性

- Next.js が本番モードで起動
- 開発用ミドルウェアを無効化
- パフォーマンス最適化

---

### 依存関係のインストール

```dockerfile
COPY --from=prod-build /app/package*.json ./
RUN npm ci --omit=dev
```

#### `--omit=dev`

- **devDependencies を除外**:
  - TypeScript、ESLint、テストツール等が不要
  - イメージサイズが数百 MB 削減可能
  - セキュリティリスク低減

**比較**:

```text
全依存関係: 500MB
本番のみ: 150MB
削減率: 70%
```

---

### ビルド成果物のコピー

```dockerfile
COPY --from=prod-build /app/.next ./.next
COPY --from=prod-build /app/public ./public
COPY --from=prod-build /app/next.config.js* ./ 2>/dev/null || true
```

#### `COPY --from=prod-build`

**マルチステージビルドの核心**:

- 別ステージからファイルをコピー
- ビルドツールやソースコードは含まれない

#### `2>/dev/null || true`

**エラー許容の技法**:

- next.config.js が存在しない場合も OK
- エラー出力を捨てる
- `|| true`でビルド失敗を防ぐ

**必要なファイル**:

- **`.next/`**: ビルドされたアプリケーション（必須）
- **`public/`**: 静的アセット（画像、font 等）
- **`next.config.js`**: 実行時設定（オプション）

---

### 実行設定

```dockerfile
RUN chown -R nodeapp:nodeapp /app
USER nodeapp

CMD ["npm","run","start","--","-H","0.0.0.0","-p","3000"]
```

#### `USER nodeapp`

- **この行以降は全て nodeapp ユーザーで実行**
- root ユーザーが不要（セキュリティ ◎）

#### CMD 解説

```bash
npm run start -- -H 0.0.0.0 -p 3000
```

- **`npm run start`**: package.json の`start`スクリプト（通常は`next start`）
- **`--`**: npm への引数と next への引数の区切り
- **`-H 0.0.0.0`**: 全てのネットワークインターフェースで待ち受け
  - デフォルトの localhost だとコンテナ外からアクセス不可
- **`-p 3000`**: ポート指定

---

## 3. docker-compose.dev.yml の解説

## ボリューム戦略

```yaml
volumes:
  - web-src:/app
  - web-node-modules:/app/node_modules
  - web-next-cache:/app/.next
```

### 3 層ボリューム構造

#### 1. `web-src:/app` (Named Volume)

**全体のベース**:

- アプリケーションコード全体
- compose watch で同期される

#### 2. `web-node-modules:/app/node_modules` (Named Volume)

**オーバーライド**:

- `/app/node_modules`を独立管理
- ホストの node_modules と混在しない
- **理由**:
  - ホストとコンテナで OS が異なる場合にバイナリ互換性問題
  - macOS/Windows ホスト + Linux コンテナ

#### 3. `web-next-cache:/app/.next` (Named Volume)

**ビルドキャッシュの永続化**:

- 再起動してもキャッシュ維持
- 開発時のビルド時間短縮

### ボリュームマウントの優先順位

```text
/app                  ← web-src
/app/node_modules     ← web-node-modules (上書き)
/app/.next            ← web-next-cache (上書き)
```

**Docker の仕様**: より具体的なマウントが優先される

---

## Compose Watch 設定

```yaml
develop:
  watch:
    - action: sync
      path: .
      target: /app
      ignore:
        - node_modules
        - .next
        # ...
```

### 動作メカニズム

**リアルタイム同期**:

```text
ホスト: src/app/page.tsx 変更
   ↓ (即座に)
コンテナ: /app/src/app/page.tsx 更新
   ↓
Next.js: ホットリロード
   ↓
ブラウザ: 自動更新
```

### ignore 設定の重要性

**除外すべきディレクトリ**:

1. **ビルド成果物**: `.next`, `out`, `dist`, `build`

   - コンテナ内で生成すべき

2. **依存関係**: `node_modules`

   - Named volume で管理

3. **テスト関連**: `coverage`, `playwright-report`

   - サイズが大きく、同期不要

4. **VCS/IDE**: `.git`, `.vscode`, `.idea`
   - 同期しても意味がない

**パフォーマンス影響**:

- `node_modules`(数 GB)を同期すると数分かかる
- ignore で数秒に短縮

---

## 環境変数設計

```yaml
environment:
  NODE_ENV: development
  PORT: 3000
  SUPABASE_URL: ${SUPABASE_URL}
  SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY}
env_file:
  - .env
```

### 2 段階設定

#### 1. `environment:` 直接指定

- **明示的な設定**: コードレビューで見える
- **環境変数展開**: ホストの`${SUPABASE_URL}`を使用

#### 2. `env_file:` ファイル読み込み

- **秘密情報**: `.gitignore`で管理
- **ローカル開発**: 各開発者が独自の`.env`を持つ

---

## 4. docker-compose.prod.yml の解説

```yaml
build:
  context: .
  target: prod-runtime
```

## ターゲット指定

**マルチステージの特定ステージをビルド**:

```text
dev-base → スキップ
prod-build → 実行（成果物作成）
prod-runtime → これをビルド
```

---

## 本番環境の特徴

### ボリュームを使わない理由

```yaml
# prod は基本ボリューム不要（再現性重視）
```

**開発環境**:

```text
volumes:
  - .:/app  # ホストと同期
```

**本番環境**:

```text
# ボリューム無し
# 全てイメージに焼き込み済み
```

**メリット**:

1. **完全な再現性**: どこで起動しても同じ
2. **パフォーマンス**: I/O オーバーヘッド無し
3. **セキュリティ**: ホストファイルシステムに依存しない
4. **不変性**: コンテナは読み取り専用として扱える

---

## ヘルスチェック

```yaml
healthcheck:
  test: ["CMD-SHELL", "wget -qO- http://localhost:3000 || exit 1"]
  interval: 10s
  timeout: 5s
  retries: 12
  start_period: 30s
```

### 各パラメータの意味

- **`test`**: 実行するコマンド

  - `wget -qO-`: 静かに標準出力に取得
  - `|| exit 1`: 失敗時は終了コード 1

- **`interval: 10s`**: 10 秒ごとにチェック
- **`timeout: 5s`**: 5 秒以内に応答必要
- **`retries: 12`**: 12 回連続失敗で unhealthy
- **`start_period: 30s`**: 起動後 30 秒は失敗をカウントしない
  - Next.js の起動時間を考慮

### ヘルスチェックの効果

**Kubernetes/ECS 等での利用**:

```text
unhealthy → コンテナ再起動
healthyになるまでトラフィック送らない
```

---

## 5. 全体アーキテクチャの優位性

## 開発から本番まで一貫したフロー

```text
開発環境:
Dockerfile(dev-base) + compose.dev.yml
  ↓ コードをテスト
本番環境:
Dockerfile(prod-runtime) + compose.prod.yml
  ↓ 本番デプロイ
```

## 主要な設計パターン

### 1. **レイヤードキャッシング**

```text
package.json変更なし → npm ciスキップ (数分節約)
```

### 2. **マルチステージビルド**

```text
ビルドイメージ: 1.5GB
本番イメージ: 400MB
削減率: 73%
```

### 3. **セキュリティ多層防御**

```text
非rootユーザー ✓
最小限のパッケージ ✓
devDependencies除外 ✓
```

### 4. **開発体験の最適化**

```text
ホットリロード ✓
高速起動 (ウォームアップ) ✓
レースコンディション対策 ✓
```

### 5. **本番環境の堅牢性**

```text
不変性 ✓
ヘルスチェック ✓
グレースフルシャットダウン ✓
```

---

## まとめ

この構成は**エンタープライズグレード**の Docker セットアップです:

✅ **開発体験**: compose watch + ホットリロード
✅ **セキュリティ**: 非 root 実行、最小権限
✅ **パフォーマンス**: キャッシング戦略、マルチステージ
✅ **本番対応**: 不変イメージ、ヘルスチェック
✅ **保守性**: 明確な責任分離、コメント充実

特に`start-dev.sh`の**権限降格 → ウォームアップ → 同期待ち**の 3 段階処理は、実践的な問題を全てカバーした秀逸な設計です。
