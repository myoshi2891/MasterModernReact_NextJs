# 仕様書インデックス

> 更新履歴: 2025-12-24 初版策定

このディレクトリには、機能ごとの仕様書 (spec/plan/tasks) を管理します。

## 運用ルール

1. 新規機能は `specs/NNN-<feature-name>/` を作成
2. 各ディレクトリには以下のファイルを配置:
   - `spec.md` - 要件・受入基準・設計
   - `plan.md` - 実装計画・ファイル一覧
   - `tasks.md` - タスク分解・進捗管理
3. 完了した仕様は `Status: 完了` に更新

## 仕様書一覧

| ID | 名称 | Status | 概要 |
|----|------|--------|------|
| 001 | [sample-feature](001-sample-feature/) | サンプル | テンプレートの使用例 |
| 002 | [booking-concurrency-control](002-booking-concurrency-control/) | DB制約実装完了 | 予約の同時実行対策（重複予約防止） |
| 003 | [typescript-migration](../typescript-migration-plan.md) | **Phase 1完了** | JSからTSへの段階的移行 |

## 詳細

### 001: サンプル機能

- **目的**: 仕様書テンプレートの使用例
- **ファイル**:
  - [spec.md](001-sample-feature/spec.md)
  - [plan.md](001-sample-feature/plan.md)
  - [tasks.md](001-sample-feature/tasks.md)
- **備考**: 新規機能追加時の参考として利用

### 002: 予約の同時実行対策

- **目的**: DB制約による重複予約防止とデータ整合性の担保
- **ファイル**:
  - [spec.md](002-booking-concurrency-control/spec.md)
  - [plan.md](002-booking-concurrency-control/plan.md)
  - [tasks.md](002-booking-concurrency-control/tasks.md)
- **主要要件**:
  - Postgres EXCLUDE 制約で日付範囲の重複を物理的に禁止
  - 競合時は 409 Conflict を返却
  - idempotency key による二重送信対策（任意）
- **技術的ポイント**:
  - `btree_gist` 拡張の利用
  - `daterange` / `tstzrange` による期間重複チェック
  - トリガーによるキャパシティ検証

### 003: TypeScript 移行

- **目的**: JavaScript から TypeScript への段階的移行（挙動を変えない）
- **ファイル**: [typescript-migration-plan.md](../typescript-migration-plan.md)
  - ※ 詳細な計画（700行以上）のため、専用ファイルで管理
- **現在のステータス**: **Phase 1 完了**（基盤構築）
- **Phase 概要**:
  - Phase 1: 基盤構築（tsconfig.json、型定義ファイル）✅ 完了
  - Phase 2: データ/認証レイヤー移行（`app/_lib/*.js` → `.ts`）
  - Phase 3: API ルート & Middleware 移行
  - Phase 4: コンポーネント & ページ移行（`.jsx` → `.tsx`）
  - Phase 5: Strict モード解決 & 最終化
  - Phase 6: テストファイル移行
- **成果物**:
  - `tsconfig.json` - strict モード有効
  - `types/domain.ts` - ドメイン型（Cabin, Booking, Guest 等）
  - `types/supabase.ts` - Supabase Database 型
  - `types/next-auth.d.ts` - NextAuth セッション拡張
  - `types/env.d.ts` - 環境変数型定義
  - `types/server-actions.ts` - Server Action ヘルパー

## 今後追加予定

| ID | 名称 | 優先度 | 概要 |
|----|------|--------|------|
| 004 | npm-to-bun | 低 | npmからBunへの移行 |
| 005 | structured-logging | 低 | 構造化ログの導入 |

## テンプレート

新規仕様書作成時は以下のテンプレートを使用:

- [.specify/templates/spec.md.tpl](../.specify/templates/spec.md.tpl)
- [.specify/templates/plan.md.tpl](../.specify/templates/plan.md.tpl)
- [.specify/templates/tasks.md.tpl](../.specify/templates/tasks.md.tpl)

## 関連ドキュメント

- [CLAUDE.md](../CLAUDE.md) - プロジェクト概要
- [constitution.md](../.specify/memory/constitution.md) - 品質・非機能要件
- [architecture.md](../.specify/memory/architecture.md) - アーキテクチャ設計
- [progress.md](../docs/progress.md) - 進捗ログ
