# Plan 004: ドキュメントのバージョンドリフトを解消する（tech-stack / README / CLAUDE.md）

> **Executor instructions**: このプランをステップ順に実行すること。各ステップの
> 検証コマンドを実行し、期待結果を確認してから次に進むこと。「STOP conditions」
> のいずれかが発生したら、中断して報告すること。完了したら `plans/README.md` の
> 該当ステータス行を更新すること。
>
> **Drift check (run first)**: `git diff --stat 5457faa..HEAD -- ".specify/memory/tech-stack.md" "README.md" "CLAUDE.md" "README_next_action.md" "package.json" ".env.example"`
> in-scope ファイルに変更があれば、「Current state」の抜粋と実コードを突き合わせ、
> 不一致があれば STOP condition として扱うこと。

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW（ドキュメントのみ、コード変更なし）
- **Depends on**: none
- **Category**: docs
- **Planned at**: commit `5457faa`, 2026-07-04

## Why this matters

リポジトリは Next.js 16 / TS 6 / Tailwind v4 / Auth.js v5 への移行を完了したが、
主要ドキュメントの一部が移行前のまま。`tech-stack.md` は全コアバージョンが
1メジャー以上古く（Next 14 / React 18 / NextAuth v4 表記）、`README.md` は
Next 15 と存在しない `.js` ファイルパスを大量に参照し、`CLAUDE.md` の環境変数
ブロックは Auth.js v5 で使われない `NEXTAUTH_URL` / `NEXTAUTH_SECRET` を記載し、
本番必須の `HASH_SALT` を欠く。**誤ったドキュメントは欠落より有害** — この
とおりに設定すると認証は起動せず、ロギングは本番でクラッシュする。

## Current state

真実の源（これに合わせる）:

- `package.json` — 実バージョン: next `^16.2.7`、react `19.2.7`、
  next-auth `5.0.0-beta.31`、tailwindcss `^4.3.0`、react-day-picker `^10.0.1`、
  date-fns `^4.4.0`、vitest `^4.1.8`、eslint `^9`、typescript `^6.0.3`、
  eslint-config-next `^16.2.7`
- `.env.example` — 実際の環境変数（実読で確認済み）: `NEXT_PUBLIC_SUPABASE_URL`、
  `NEXT_PUBLIC_SUPABASE_KEY`、`SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`、
  `AUTH_GOOGLE_ID`、`AUTH_GOOGLE_SECRET`、`AUTH_SECRET`、`AUTH_URL`、
  `HASH_SALT`（コメント: required in production、`openssl rand -hex 32` で生成）、
  任意: `PLAYWRIGHT_BASE_URL`、`TZ`、`NEXT_IMAGES_DANGEROUSLY_ALLOW_LOCAL_IP`
- `app/_lib/logger.ts` — `HASH_SALT` が本番で未設定/32文字未満なら throw

ドリフト箇所（実読・grep で確認済み）:

1. `.specify/memory/tech-stack.md` — 更新履歴が「2025-12-24 初版策定」のみ。
   10〜11行: `Next.js | 14.2.35`、`React | ^18`。以降の NextAuth v4 設定例、
   Tailwind v3、react-day-picker v8、date-fns v3、Vitest 3、ESLint 8 記述も同様
2. `README.md` — 59行 `next ^15.5.10`、61行 `next-auth 5.0.0-beta.30`、
   76行 `eslint-config-next 14.2.5`、84行「Next.js 15 App Router」、
   92〜98行ほか多数の `DateSelector.js` / `app/cabins/page.js` 等の `.js` 参照
   （実ファイルは `.tsx` / `.ts`）
3. `CLAUDE.md` — 「環境変数 (.env)」ブロック（143〜157行付近）が
   `NEXTAUTH_URL` / `NEXTAUTH_SECRET` を記載（コードは参照していない）。
   `AUTH_SECRET` / `AUTH_URL` / `HASH_SALT` が欠落
4. `README_next_action.md` — `npm ci` / package-lock.json / Next.js 14 /
   NextAuth v4 前提の記述（リポジトリは Bun / bun.lock に移行済み）

リポジトリ規約:

- Markdown は `.markdownlint.json` に準拠（フェンス前後に空行 MD031、連続空行
  禁止 MD012、末尾改行1つ MD047）。`scripts/format-markdown.mjs` が存在する
- docs 更新時は各文書の「更新履歴」/「Last Updated」に日付エントリを追加する
  のがプロジェクト慣行（docs-sync 運用）
- コミット型は `docs`（`.claude/rules/tdd-mandatory-cycle.md` の TDD サイクルは
  コードロジック変更がないため適用外。ただしコミット分割は行う）
- **絶対パス・ユーザー名をドキュメントに書かない**
  （`.claude/rules/no-absolute-paths.md`）。コミット前に必ず:

```bash
git diff --cached | grep -E '^\+[^+]' | grep -E '(/Users/|/home/|C:\\Users\\)' | grep -vE 'johndoe'
```

  が**空出力**であることを確認すること。

## Commands you will need

| Purpose        | Command                                    | Expected on success |
|----------------|--------------------------------------------|---------------------|
| バージョン確認    | `cat package.json`                         | 真実の源            |
| ドリフト検索     | 下記 Done criteria の grep 群                | 0件                 |
| Lint（回帰確認）  | `bun run lint`                             | exit 0              |

## Steps

### Step 1: `.specify/memory/tech-stack.md` を再生成

`package.json` からバージョン表を作り直す。NextAuth v4 スタイルの設定例が
あれば Auth.js v5 の形（`app/_lib/auth.ts` の `export const { handlers, auth,
signIn, signOut } = NextAuth({...})`）に差し替える。Tailwind v4
（`@import "tailwindcss"`）、ESLint 9 flat config（`eslint.config.mjs`、
`next lint` 廃止）、Vitest 4 / jsdom 29 / react-day-picker 10 / date-fns 4 を
反映。更新履歴に「2026-07-04 監査に伴う全面バージョン同期」等の行を追加。
コミット: `docs(specify): sync tech-stack.md with actual dependency versions`

### Step 2: `README.md` を更新

1. 依存表（59行付近〜）を `package.json` に合わせる
2. 「Next.js 15」表記をすべて「Next.js 16」に（動的レンダリング既定の注記は
   `CLAUDE.md` の cabins 詳細ページの記述と整合させる）
3. ソースファイル参照の `.js` を実在の拡張子（`.tsx` / `.ts`）に置換。
   置換前に `ls app/_components/ app/_lib/` で実在を確認すること
4. `engines` 記述（80行付近）: `package.json` に `engines` フィールドは
   **存在しない**ため、「CI は Node 20.19.6 / 22.x で検証」という事実ベースの
   記述に改める

コミット: `docs(readme): update to Next.js 16 and TypeScript file references`

### Step 3: `CLAUDE.md` の環境変数ブロックを修正

「環境変数 (.env)」ブロックを `.env.example` と一致させる:
`NEXTAUTH_URL` / `NEXTAUTH_SECRET` を削除し、`AUTH_SECRET` / `AUTH_URL` を記載。
`HASH_SALT`（本番必須、`openssl rand -hex 32` で生成、`app/_lib/logger.ts` が
検証する旨）を追加。他のセクションは変更しない。
コミット: `docs(claude): fix Auth.js v5 env var names and add HASH_SALT`

### Step 4: `README_next_action.md` の扱い

ファイル冒頭に「このドキュメントは Next.js 14 / npm 時代のアーカイブであり、
現行のエントリポイントは `CLAUDE.md` と `README.md`」という注記を追加する
（全面書き換えはしない — アーカイブ扱い）。`npm ci` の手順記述の直前にも
「現行は `bun install`」の1行注記を入れる。
コミット: `docs: mark README_next_action.md as archived guidance`

## Hard boundaries

- **In scope**: `.specify/memory/tech-stack.md`、`README.md`、`CLAUDE.md`
  （環境変数ブロックのみ）、`README_next_action.md`（注記追加のみ）
- **Out of scope**: `package.json`（`engines` の追加はコード側の判断 —
  別所見 DEPS-03）、`.env.example`（正しい状態が真実の源）、
  `.specify/memory/architecture.md` と `constitution.md`（監査で概ね最新と確認
  済み）、`docs/progress.md`（完了時に1エントリ追記するのは可）、コード一切

## Done criteria（機械検証可能）

- `grep -n "NEXTAUTH_URL\|NEXTAUTH_SECRET" CLAUDE.md` — 0件
- `grep -n "HASH_SALT" CLAUDE.md` — 1件以上
- `grep -n "14\.2\.35" .specify/memory/tech-stack.md` — 0件
- `grep -nE "next \| \^15|Next\.js 15" README.md` — 0件
- `grep -nE "DateSelector\.js|ReservationForm\.js|page\.js|layout\.js|auth\.js\b" README.md` — 0件
- `bun run lint` — exit 0（回帰なし）
- コミット前 PII チェック（上記 grep パイプ）が全コミットで空出力

## Test plan

ドキュメントのみのため自動テストは対象外。上記 grep 群が検証ゲート。
markdownlint 設定がある場合は `node scripts/format-markdown.mjs`（存在すれば）
または目視で MD031/MD012/MD047 を確認。

## Maintenance note

依存メジャーアップデート時は本プランの grep 群を再実行してドリフトを検出できる。
恒久対策として docs-sync 運用（更新履歴の日付更新）を徹底すること。

## STOP conditions

- `package.json` のバージョンが本プランの「真実の源」記載と一致しない場合 →
  ドリフトしている。実際の `package.json` を真とし、差分が大きければ STOP して報告
- `README.md` 内で `.js` 参照が意図的な JavaScript 説明（拡張子の説明等）で
  ある箇所に遭遇したら、機械置換せず文脈判断し、迷ったら STOP
- PII チェック grep が何かを検出したら、コミットを中止して該当行を修正すること
