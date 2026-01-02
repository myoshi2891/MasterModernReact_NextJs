# 004: npm to Bun 移行 - 実装計画

> Status: **完了**

## 実装ステップ

### Step 1: Dockerfile 更新

1. ベースイメージを `oven/bun:1.3-debian` に変更
2. Node.js を追加インストール（Next.js 互換性のため）
3. SHELL オプションで pipefail を設定
4. `npm` コマンドを `bun` に置換

### Step 2: CI/CD 更新

1. `.github/workflows/ci.yml` に `setup-bun` アクションを追加
2. Bun バージョンを Dockerfile と一致させる（1.3）
3. すべての `npm` コマンドを `bun` に置換
4. lint-and-test ジョブと e2e ジョブの両方を更新

### Step 3: ロックファイル移行

1. `package-lock.json` を削除
2. `bun install` で `bun.lock` を生成
3. `.gitignore` の確認（bun.lock は追跡対象）

### Step 4: ドキュメント更新

1. `CLAUDE.md` のクイックスタートセクションを更新
2. よく使うコマンドセクションを更新

## 変更ファイル一覧

| ファイル | 変更種別 | 内容 |
|---------|---------|------|
| Dockerfile | 修正 | ベースイメージ、SHELL、コマンド |
| .github/workflows/ci.yml | 修正 | setup-bun、bun-version、コマンド |
| CLAUDE.md | 修正 | npm → bun コマンド置換 |
| package-lock.json | 削除 | npm ロックファイル削除 |
| bun.lock | 追加 | Bun ロックファイル |

## 検証項目

- [x] ローカル環境で `bun install` が成功
- [x] ローカル環境で `bun run dev` が起動
- [x] ローカル環境で `bun run build` が成功
- [x] ローカル環境で全テストが通過
- [x] Docker ビルドが成功
- [x] CI パイプラインが成功
