# 005: 構造化ログ導入 - タスク一覧

> Status: **完了**
> 最終更新: 2026-01-01

## タスク

### Phase 1: logger.ts 作成

- [x] `app/_lib/logger.ts` ファイル作成
- [x] 型定義（LogLevel, BookingConflictLogEntry）
- [x] `hashUserId()` 関数実装
- [x] `generateRequestId()` 関数実装
- [x] `StructuredLogger` クラス実装
- [x] シングルトン logger エクスポート

### Phase 2: セキュリティ強化

- [x] 本番環境での HASH_SALT 必須チェック
- [x] randomUUID インポート修正
- [x] 開発用デフォルト salt 設定

### Phase 3: actions.ts 統合

- [x] requestId 生成追加
- [x] 処理時間計測（startTime）
- [x] 23P01/23505 エラー時のログ出力
- [x] responseTimeMs の記録

### Phase 4: テスト作成

- [x] `tests/unit/logger.test.ts` 作成
- [x] hashUserId テスト（5 件）
- [x] generateRequestId テスト（3 件）
- [x] bookingConflict テスト（6 件）
- [x] 全テスト通過確認

### Phase 5: ドキュメント更新

- [x] operations.md に HASH_SALT 要件追加
- [x] operations.md にレスポンス時間閾値追加
- [x] 予防策セクションに実装済み項目追加

## 完了コミット

- `a09e76b` - feat: implement structured logging for booking conflicts