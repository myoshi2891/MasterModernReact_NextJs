---
name: check-docs-sync
description: >
  Verify and update documentation after a git push containing feat/fix/refactor commits.
  TRIGGER when the user says any of the following (Japanese or English):
  - "ドキュメントを同期して" / "ドキュメント更新漏れを確認"
  - "push したからドキュメント確認して" / "仕様書を最新化"
  - "docs が古い" / "stale docs" / "doc sync" / "docs sync"
  - "/check-docs-sync"
  Detects stale sections in CLAUDE.md, README.md, TEST_PLAN.md, and
  .claude/skills/*/SKILL.md by comparing git-diff output against actual file state.
  Updates only the sections that are out of date. Does NOT run tests.
allowed-tools:
  - Bash
  - Read
  - Edit
---

# ドキュメント同期スキル

## 概要

このスキルは `git diff` で変更ファイルを特定し、ファイル種別→更新対象ドキュメントの
マッピングテーブルに従って **必要なドキュメントのセクションのみ** を更新する。

| 原則 | 内容 |
|---|---|
| 最小 Read | セクション行番号を先に `grep -n` で特定し `offset + limit` で部分読み込み |
| 事実のみ記録 | `find` / `grep` の実測値のみ使用。推測で記述しない |
| 1 箇所ずつ Edit | 複数箇所を一括置換せず 1 Edit = 1 変更 |
| CLAUDE.md が SSoT | コマンド・設定の不一致は常に CLAUDE.md に従う |
| Playwright 禁止 | ブラウザ操作は行わない（プロジェクトルール） |

---

## Step 1: コミット範囲と変更ファイルの取得

### 1-1. コミット範囲を確定する

ユーザーが明示的にコミット範囲（例: `abc123..HEAD` や `HEAD~3..HEAD`）を指定した場合はそれを使用する。
指定がない場合は最新の feat / fix / refactor コミットを確認して範囲を決める:

```bash
git log --oneline -10
```

デフォルトは、最新の feat / fix / refactor コミットを起点とした範囲。

### 1-2. 変更ファイル一覧を取得する

最新の feat / fix / refactor コミットのハッシュを起点に差分を取得する:

```bash
BASE=$(git log --format="%H" --grep='^feat\|^fix\|^refactor' -n 1 2>/dev/null)
if [ -n "$BASE" ]; then
  git diff --name-only "${BASE}^..HEAD"
else
  # 対象コミットが見つからない場合のフォールバック
  git diff --name-only HEAD~1..HEAD
fi
```

ユーザーがコミット範囲を明示した場合（例: `abc123..HEAD`）はそのまま使用する:

```bash
git diff --name-only <from>..<to>
```

---

## Step 2: ファイル種別 → 更新対象ドキュメントのマッピング

Step 1-2 の出力と以下のテーブルを照合し、更新が必要なドキュメントを列挙する。
複数のパターンに該当する場合は全て列挙する。

| 変更されたファイルのパターン | 更新対象ドキュメント |
|---|---|
| `app/_lib/**/*.ts`（新規追加） | `CLAUDE.md` _lib/ ツリー、`README.md` |
| `app/_components/**/*.tsx`（新規追加） | `CLAUDE.md` _components/ ツリー |
| `.github/workflows/*.yml` | `CLAUDE.md` §CI構成 |
| `docker-compose.yml` / `Dockerfile` | `CLAUDE.md` §Docker環境、`README.md` §Docker |
| `*.test.ts` / `*.test.tsx`（新規追加） | `/docs-sync` スキルでテスト進捗（`docs/progress.md`）を更新するよう促す |
| `.claude/skills/*/SKILL.md` | CLAUDE.md §CI構成 の SSoT コマンドと照合する |

対象ドキュメントが 0 件の場合はその旨を報告して終了する。

---

## Step 3: 対象セクションの行番号を特定する

各 (ドキュメント, セクション) のペアについて、`grep -n` でセクション開始行を特定する。

### よく使うパターン

```bash
# CLAUDE.md のセクション位置
grep -n "## ディレクトリ構造\|## CI構成\|## クイックスタート" CLAUDE.md

# README.md のセクション位置
grep -n "## 技術スタック\|## ディレクトリ構造" README.md

# pre-commit-check/SKILL.md のコマンド位置
grep -n "bun run" .claude/skills/pre-commit-check/SKILL.md
```

---

## Step 4: 対象セクションを部分読み込みする

行番号が判明したら `offset` と `limit` を指定して対象範囲だけを Read する。
ファイル全体の読み込みは禁止。

---

## Step 5: コード実態を確認する

ドキュメントと比較するための実際のファイル状態を取得する。

### _lib/ ツリーの実態確認

```bash
find app/_lib -maxdepth 1 \( -name "*.ts" -o -name "*.tsx" \) \
  -not -name "*.test.*" -not -name "*.d.*" | sort
```

### _components/ ツリーの実態確認

```bash
find app/_components -maxdepth 2 -name "*.tsx" \
  -not -name "*.test.*" | sort
```

### CI コマンドの確認

CLAUDE.md の `## CI構成` または `## クイックスタート` セクションを Read して正しいコマンドを確認する（外部ツール実行不要）。

---

## Step 6: 差分を判定して Edit する

Step 4（ドキュメントの現状）と Step 5（コードの実態）を比較し:

- **差分なし** → そのドキュメント/セクションをスキップ（変更しない）
- **差分あり** → 以下のパターンに従って Edit する。1 箇所ずつ順番に実行する

### 6-1. _lib/ ツリーへのファイル追記

CLAUDE.md と README.md の _lib/ ブロックに不足しているファイルを追記する。

書式（既存行のインデント・説明スタイルに合わせる）:

```text
│   ├── site-url.ts          サイト URL 解決ユーティリティ (resolveSiteUrl)
```

説明が不明な場合は対象ファイルの冒頭コメントまたは JSDoc を Read して確認する。
末尾の `└──` を持つ行を `├──` に変えてから新行を `└──` で追加する。

### 6-2. SKILL.md のコマンド修正

`.claude/skills/*/SKILL.md` 内のコマンドが CLAUDE.md §クイックスタート と食い違っている場合:

| 典型的な誤りパターン | 正しい記述 |
|---|---|
| `cd web-next &&` | (ルートディレクトリで実行するため削除) |
| `bun test` | `bun run test:all` |
| 旧設定ファイルパス (`web-next/...` 等) | ルートベースの現行パス |

### 6-3. MIGRATION_PROGRESS.md の扱い（スキップ）

`docs/progress.md` は進捗状態を示すドキュメントですが、本スキルでの自動同期ではなく、テスト実行結果に基づき `/docs-sync` スキルで更新を行います。
このスキルでは変更対象外。

### 6-4. テスト数の更新（このスキルでは対応しない）

テスト数の変更は grep で正確に計測できないため、このスキルでは対応しない。`/docs-sync` スキルを使うよう促す。

---

## Step 7: 実行結果を報告する

以下の形式でまとめる（テーブルで差分なし / 更新済み / スキップを明記）:

```
## ドキュメント同期レポート

### 対象コミット範囲
HEAD~1..HEAD

### 変更されたファイル（対象パターンにマッチしたもの）
- app/_lib/site-url.ts（新規）

### 確認・更新結果

| ドキュメント | セクション | 結果 |
|---|---|---|
| CLAUDE.md | _lib/ ツリー | 更新: site-url.ts 行を追記 |
| README.md | _lib/ ツリー | 更新: site-url.ts 行を追記 |

### テスト追加を検知した場合
app/_lib/site-url.test.ts が追加されています。
テスト数の更新は `/docs-sync` を実行してください。
```

---

## 注意事項

- **ビルド・テスト実行禁止**（`bun run build` / `bun run test:all` は実行しない）
- **推測で記述しない**（`find` / `grep` の実測値のみ）
- **テスト数は grep で計測しない**（`/docs-sync` に委譲）
