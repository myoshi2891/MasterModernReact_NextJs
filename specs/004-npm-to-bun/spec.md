# 004: npm to Bun 移行

> Status: **完了**
> 作成日: 2026-01-01
> 完了日: 2026-01-01

## 概要

パッケージマネージャーを npm から Bun へ移行し、開発・CI/CD 環境の高速化を実現する。

## 背景

- npm install の実行時間が長く、CI パイプラインのボトルネックになっている
- Bun は npm 互換でありながら、インストール速度が大幅に向上している
- Next.js 14 は Bun との互換性が確認されている

## 要件

### 機能要件

1. すべての npm コマンドを bun コマンドに置換
2. package-lock.json を bun.lock に移行
3. 既存の依存関係がすべて正常に解決される

### 非機能要件

1. CI/CD パイプラインの実行時間短縮
2. 開発環境でのインストール時間短縮
3. 既存のビルド・テスト・リントが正常に動作

## 受入基準

- [x] `bun install` でプロジェクトがセットアップできる
- [x] `bun run dev` で開発サーバーが起動する
- [x] `bun run build` でビルドが成功する
- [x] `bun run test:unit` でユニットテストが通過する
- [x] CI パイプラインが Bun を使用して正常に完了する
- [x] Docker イメージが Bun ベースで動作する

## 影響範囲

| ファイル/ディレクトリ | 変更内容 |
|---------------------|---------|
| Dockerfile | ベースイメージを `oven/bun:1.3-debian` に変更 |
| .github/workflows/ci.yml | `setup-bun` アクション追加、コマンド置換 |
| CLAUDE.md | クイックスタートコマンドを bun に更新 |
| package-lock.json | 削除（bun.lock に置換） |
| bun.lock | 新規追加 |

## リスク

| リスク | 対策 |
|-------|------|
| Bun と Next.js の互換性問題 | Next.js の実行には Node.js を併用（oven/bun は Node.js も含む） |
| CI での Bun バージョン差異 | Dockerfile と CI で同じバージョン（1.3）を使用 |

## 関連ドキュメント

- [plan.md](plan.md) - 実装計画
- [tasks.md](tasks.md) - タスク一覧