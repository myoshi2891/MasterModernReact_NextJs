---
name: pre-commit-check
description: >
  Run all tests and builds before committing to verify code quality.
  TRIGGER when the user says any of the following (Japanese or English):
  - "コミット前チェック" / "テスト実行" / "ビルドとテスト" / "CI 確認"
  - "全部テストして" / "コミットしていいか確認"
  - "pre-commit check" / "run tests" / "check before commit" / "verify build"
  Validates project build (bun run build) and tests (bun run test:all).
invocation: explicit
allowed-tools:
  - Bash
  - Read
  - Grep
  - Glob
---

# コミット前チェックスキル

## 概要

CLAUDE.md で定義されたコミット前チェックリストを順次実行する。
いずれかのステップが失敗した場合は**即座に停止**してユーザーに報告する。

## 実行手順

### Step 1: ビルド

```bash
bun run build
```

`next build` が実行される。型エラー・ビルドエラーがないことを確認する。

### Step 2: テスト

```bash
bun run test:all
```

vitest および playwright が実行される。全テスト PASS を確認する。

### Step 3: 設定ファイルの意図しない変更チェック

以下のファイルが意図せず変更されていないか `git diff` で確認する:

- `next.config.mjs`
- `vitest.config.mts`
- `playwright.config.ts`
- `tsconfig.json`
- `package.json`
- `bun.lock`

変更がある場合はユーザーに報告して確認を求める。

### Step 4: import の有効性

ビルド（Step 1）が成功していれば import は有効と判断できる。
追加の確認は不要。

## 判定基準

| 結果 | アクション |
| --- | --- |
| 全ステップ成功 | 「コミット OK」と報告 |
| いずれか失敗 | **停止**してエラー内容をユーザーに報告。自動修正しない |

## 注意事項

- このスキルは `invocation: explicit` — `/pre-commit-check` での手動呼び出しのみ
- テストの書き直しや設定ファイルの変更は行わない
- 失敗時は原因の特定と報告のみ行い、修正はユーザーの指示を待つ
