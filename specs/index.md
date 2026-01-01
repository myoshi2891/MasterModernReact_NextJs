# 仕様書インデックス

> 更新履歴: 2025-12-24 初版策定、2025-12-31 TypeScript Phase 6 完了、2026-01-01 specs/002 全タスク完了・004/005 完了

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
| 002 | [booking-concurrency-control](002-booking-concurrency-control/) | **完了** | 予約の同時実行対策（重複予約防止） |
| 003 | [typescript-migration](../typescript-migration-plan.md) | **Phase 6 完了** | JSからTSへの段階的移行 |
| 004 | [npm-to-bun](004-npm-to-bun/) | **完了** | npmからBunへの移行 |
| 005 | [structured-logging](005-structured-logging/) | **完了** | 409 Conflict の構造化ログ導入 |

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
- **現在のステータス**: **Phase 6 完了**（テストファイル移行 & 完全TypeScript化）
- **Phase 概要**:
  - Phase 1: 基盤構築（tsconfig.json、型定義ファイル）✅ 完了
  - Phase 2: データ/認証レイヤー移行（`app/_lib/*.js` → `.ts`）✅ 完了
  - Phase 3: API ルート & Middleware 移行 ✅ 完了
  - Phase 4: コンポーネント & ページ移行（`.jsx` → `.tsx`）✅ 完了
  - Phase 5: Strict モード解決 & 最終化 ✅ 完了
  - Phase 6: テストファイル移行 ✅ 完了
- **成果物**:
  - `tsconfig.json` - strict モード有効
  - `types/domain.ts` - ドメイン型（Cabin, Booking, Guest 等）
  - `types/supabase.ts` - Supabase Database 型
  - `types/next-auth.d.ts` - NextAuth セッション拡張
  - `types/env.d.ts` - 環境変数型定義
  - `types/server-actions.ts` - Server Action ヘルパー

### 004: npm-to-bun

- **目的**: パッケージマネージャーを npm から Bun へ移行
- **現在のステータス**: **完了**（2026-01-01）
- **ファイル**:
  - [spec.md](004-npm-to-bun/spec.md)
  - [plan.md](004-npm-to-bun/plan.md)
  - [tasks.md](004-npm-to-bun/tasks.md)
- **変更内容**:
  - `Dockerfile`: ベースイメージを `oven/bun:1.3-debian` に変更
  - `.github/workflows/ci.yml`: `setup-bun` アクション追加、全コマンドを bun へ
  - `CLAUDE.md`: クイックスタート/コマンドを bun に更新
  - `package-lock.json` → `bun.lock` へ置換
- **メリット**:
  - インストール速度の向上
  - CI/CD パイプラインの高速化
  - 依存関係解決の改善

### 005: structured-logging

- **目的**: 409 Conflict 発生時の構造化ログ導入（運用・監視強化）
- **現在のステータス**: **完了**（2026-01-01）
- **ファイル**:
  - [spec.md](005-structured-logging/spec.md)
  - [plan.md](005-structured-logging/plan.md)
  - [tasks.md](005-structured-logging/tasks.md)
- **関連ファイル**:
  - `app/_lib/logger.ts` - StructuredLogger クラス
  - `app/_lib/actions.ts` - createBooking へのログ統合
  - `specs/002-booking-concurrency-control/operations.md` - ログ仕様定義
- **主要機能**:
  - PII-safe な hashedUserId（SHA-256 先頭16文字）
  - requestId によるトレーサビリティ
  - responseTimeMs によるパフォーマンス計測
  - JSON 構造化出力（CloudWatch/Datadog 連携対応）
- **ログフォーマット例**:
  ```json
  {
    "timestamp": "2026-01-01T12:00:00.000Z",
    "level": "warn",
    "event": "BOOKING_CONFLICT",
    "hashedUserId": "sha256:abc123...",
    "cabinId": 1,
    "startDate": "2026-01-15",
    "endDate": "2026-01-20",
    "errorDetail": "23P01:conflicting key value"
  }
  ```

## 今後追加予定

現在、新規仕様の追加予定はありません。

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
