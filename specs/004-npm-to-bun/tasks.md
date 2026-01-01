# 004: npm to Bun 移行 - タスク一覧

> Status: **完了**
> 最終更新: 2026-01-01

## タスク

### Phase 1: Dockerfile 更新

- [x] ベースイメージを `oven/bun:1.3-debian` に変更
- [x] Node.js インストールスクリプトを追加
- [x] SHELL オプションで pipefail を設定
- [x] `npm install` を `bun install` に置換
- [x] ローカル Docker ビルドで動作確認

### Phase 2: CI/CD 更新

- [x] `setup-bun@v2` アクションを追加
- [x] `bun-version: "1.3"` を設定
- [x] lint-and-test ジョブのコマンドを bun に置換
- [x] e2e ジョブのコマンドを bun に置換
- [x] CI パイプライン実行で動作確認

### Phase 3: ロックファイル移行

- [x] `package-lock.json` を削除
- [x] `bun install` で `bun.lock` を生成
- [x] コミットに含める

### Phase 4: ドキュメント更新

- [x] `CLAUDE.md` のクイックスタートを更新
- [x] `CLAUDE.md` のよく使うコマンドを更新

## 完了コミット

- `fc06cc2` - chore: migrate from npm to bun package manager