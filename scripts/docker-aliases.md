# Common Docker & Docker Compose Aliases（日本語解説付き）

このドキュメントは、日常の Docker / Docker Compose 操作を短縮する **エイリアス集** を日本語の解説付きでまとめたものです。
以下のエイリアスを **シェルのプロファイル**（`~/.bashrc`, `~/.zshrc` など）から読み込むことで、コマンド入力を大幅に省力化できます。

> 読み込み例:
>
> ```bash
> # リポジトリ内（例：scripts/docker-aliases.sh）にある場合
> source "$(pwd)/scripts/docker-aliases.sh"
> ```
>
> ※ macOS の zsh や Linux の bash など POSIX 互換シェルで有効です。

---

## エイリアス定義（そのままコピペ可）

```bash
# Common Docker and Docker Compose aliases.
# Source this file from your shell profile, e.g.:
#   source "$(pwd)/scripts/docker-aliases.sh"

alias d="docker"
alias dc="docker compose"
alias dps="docker ps --format 'table {{.Names}}	{{.Status}}	{{.Ports}}'"
alias dimages="docker images --format 'table {{.Repository}}	{{.Tag}}	{{.Size}}'"
alias dlogs="docker logs"
alias dclean="docker system prune"
alias dclean-volumes="docker system prune --volumes"  # Warning: removes ALL unused volumes

alias dcu="docker compose up --build"
alias dcd="docker compose down"
alias dcrestart='docker compose down && docker compose up --build'
alias dcl="docker compose logs -f"
alias dcs="docker compose ps"
alias dce="docker compose exec"

# Only remove dangling images (safer than removing all unused images)
alias dprune="docker image prune"
```

---

## 一覧（サマリー）

| エイリアス       | 展開されるコマンド                                 | 用途の要約                                                           |
| ---------------- | -------------------------------------------------- | -------------------------------------------------------------------- |
| `d`              | `docker`                                           | すべての Docker サブコマンドの短縮（`d ps`, `d run` など）           |
| `dc`             | `docker compose`                                   | Compose V2 の短縮形（`dc up`, `dc down` など）                       |
| `dps`            | `docker ps --format 'table …'`                     | 稼働/停止中コンテナの **名前・状態・ポート** を表形式で表示          |
| `dimages`        | `docker images --format 'table …'`                 | 画像（イメージ）一覧を **リポジトリ・タグ・サイズ** で見やすく表示   |
| `dlogs`          | `docker logs`                                      | 単一コンテナのログ表示（`-f` で追尾）                                |
| `dclean`         | `docker system prune`                              | 未使用 **ネットワーク/ビルドキャッシュ/停止コンテナ** などを一括削除 |
| `dclean-volumes` | `docker system prune --volumes`                    | 上記に加えて **未使用ボリュームも削除**（※強力・要注意）             |
| `dcu`            | `docker compose up --build`                        | Compose でビルドして起動（差分があればリビルド）                     |
| `dcd`            | `docker compose down`                              | Compose の停止とネットワーク等のクリーンアップ                       |
| `dcrestart`      | `docker compose down && docker compose up --build` | **一撃リスタート**（確実に落としてからビルド&起動）                  |
| `dcl`            | `docker compose logs -f`                           | 複数サービスのログを **追尾表示**                                    |
| `dcs`            | `docker compose ps`                                | Compose 管理下のコンテナ一覧（状態・ポート）                         |
| `dce`            | `docker compose exec`                              | 稼働中コンテナ内でコマンド実行（`bash` など）                        |
| `dprune`         | `docker image prune`                               | **ダングリング**（タグなし）イメージのみ削除（比較的安全）           |

---

## 各エイリアスの詳説と使用例

### `d` → `docker`

- **概要**: Docker 全般のプレフィックス短縮。`docker` を `d` に省略できます。
- **例**:

  ```bash
  d version
  d info
  d run --rm -it alpine sh
  ```

---

### `dc` → `docker compose`

- **概要**: Compose V2 系列の公式サブコマンド短縮。`docker-compose` ではなく `docker compose` を前提。
- **例**:

  ```bash
  dc up -d
  dc down -v
  dc config
  ```

---

### `dps` → `docker ps --format 'table {{.Names}}  {{.Status}}  {{.Ports}}'`

- **概要**: コンテナ一覧を **Name / Status / Ports** の表で見やすく出力。
- **よくある用途**: 稼働状態と公開ポートの素早い確認。
- **例**:

  ```bash
  dps
  # 例）web  Up 2 minutes  0.0.0.0:3000->3000/tcp
  ```

---

### `dimages` → `docker images --format 'table {{.Repository}}  {{.Tag}}  {{.Size}}'`

- **概要**: ローカルイメージを **リポジトリ / タグ / サイズ** で一覧表示。
- **例**:

  ```bash
  dimages
  ```

---

### `dlogs` → `docker logs`

- **概要**: 単一コンテナのログを表示。`-f` で追尾、`--since` で期間指定が可能。
- **例**:

  ```bash
  dlogs -f my-app
  dlogs --since 1h my-worker
  ```

---

### `dclean` → `docker system prune`

- **概要**: **未使用**のコンテナ（停止中）、ネットワーク、ビルドキャッシュを削除してディスクを整理。
- **注意**: **実行前に確認プロンプトが出ます。** `-f` を付けると確認なしで削除されます。
- **例**:

  ```bash
  dclean          # 対話的に削除
  dclean -f       # 強制削除（確認なし）
  ```

---

### `dclean-volumes` → `docker system prune --volumes`

- **概要**: `dclean` に加え、**未使用のボリュームも削除**。データを失う可能性があるため要注意。
- **強い警告**: 共有ボリュームや DB データが消える恐れがあります。**本番環境や重要データでは実行しないでください。**
- **例**:

  ```bash
  dclean-volumes      # プロンプトあり
  dclean-volumes -f   # 強制削除（非常に危険）
  ```

---

### `dcu` → `docker compose up --build`

- **概要**: Compose で **ビルドしてから起動**。Dockerfile/依存が変わった時の再ビルドを自動化。
- **例**:

  ```bash
  dcu              # フォアグラウンド
  dcu -d           # バックグラウンド（デタッチ）
  ```

---

### `dcd` → `docker compose down`

- **概要**: Compose のサービスを停止し、ネットワークや一時リソースをクリーンアップ。
- **例**:

  ```bash
  dcd
  dcd -v     # ボリュームも削除（要注意）
  ```

---

### `dcrestart` → `docker compose down && docker compose up --build`

- **概要**: いったん **確実に停止 → 再ビルド → 起動** を一発で実行する再起動ショートカット。
- **用途**: 依存関係や環境変数の変更後に「一度落として作り直す」運用を簡単に。
- **例**:

  ```bash
  dcrestart
  dcrestart -d    # up に -d を渡したい場合は関数化の検討も可
  ```

---

### `dcl` → `docker compose logs -f`

- **概要**: Compose 管理下の全サービス（または指定サービス）のログを **追尾（follow）**。
- **例**:

  ```bash
  dcl                 # すべて
  dcl web             # web サービスのみ
  dcl -n 200 api      # 直近 200 行だけ
  ```

---

### `dcs` → `docker compose ps`

- **概要**: Compose のサービス/コンテナの状態を一覧表示。
- **例**:

  ```bash
  dcs
  dcs -a   # 停止中も含めて表示
  ```

---

### `dce` → `docker compose exec`

- **概要**: 稼働中コンテナ内でコマンドを実行。シェルでの調査・メンテに便利。
- **例**:

  ```bash
  dce web bash              # web コンテナに接続
  dce db psql -U postgres   # DB クライアントを起動
  ```

---

### `dprune` → `docker image prune`

- **概要**: **ダングリング（タグなし）イメージのみ**を削除。誤って必要なタグ付きイメージを消しにくい「比較的安全」なお掃除。
- **例**:

  ```bash
  dprune
  dprune -a   # すべての未使用イメージ（要注意）
  ```

---

## 運用上のヒント

- **Compose V2 前提**: 本エイリアスは `docker compose`（スペース区切り）前提です。古い `docker-compose` 単体バイナリとは異なります。
- **本番環境の慎重運用**: `dclean-volumes` や `dcd -v`, `dprune -a` は **データ消失** を招き得ます。CI/CD や本番では原則禁止にし、ローカル開発限定で使いましょう。
- **チーム共有**: リポジトリに `scripts/docker-aliases.sh` を置き、README に読み込み手順を明記するとオンボーディングがスムーズです。
- **シェル関数化**: 引数伝播や条件分岐が必要な場合は `alias` より **シェル関数** の方が柔軟です。

---

## 付録：`scripts/docker-aliases.sh` 例

```bash
#!/usr/bin/env bash
set -euo pipefail

alias d="docker"
alias dc="docker compose"
alias dps="docker ps --format 'table {{.Names}}{{.Status}}{{.Ports}}'"
alias dimages="docker images --format 'table {{.Repository}}{{.Tag}}{{.Size}}'"
alias dlogs="docker logs"
alias dclean="docker system prune"
alias dclean-volumes="docker system prune --volumes"  # Warning: removes ALL unused volumes

alias dcu="docker compose up --build"
alias dcd="docker compose down"
alias dcrestart='docker compose down && docker compose up --build'
alias dcl="docker compose logs -f"
alias dcs="docker compose ps"
alias dce="docker compose exec"

alias dprune="docker image prune"
```

> 保存後、以下で読み込み：
>
> ```bash
> source scripts/docker-aliases.sh
> ```

---

**以上**。この Markdown をそのまま社内 Wiki / リポジトリの `docs/` 配下に置いて共有できます。
