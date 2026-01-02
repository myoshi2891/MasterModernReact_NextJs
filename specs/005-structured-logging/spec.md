# 005: 構造化ログ導入

> Status: **完了**
> 作成日: 2026-01-01
> 完了日: 2026-01-01

## 概要

409 Conflict エラー発生時の構造化ログを導入し、運用監視・問題分析を強化する。

## 背景

- 予約システムでは DB 制約により 409 Conflict が発生する
- 現状では標準的なエラーログのみで、詳細な分析が困難
- 混雑とシステム異常の判別、リトライ暴走の検出が必要

## 要件

### 機能要件

1. 409 Conflict 発生時に構造化 JSON ログを出力
2. PII-safe なユーザー識別（hashedUserId）
3. リクエスト追跡用の requestId
4. パフォーマンス計測用の responseTimeMs

### 非機能要件

1. CloudWatch / Datadog 等の監視ツールとの連携が可能
2. 本番環境では HASH_SALT の設定を必須化
3. ログ出力によるパフォーマンス劣化を最小限に

## ログフォーマット

```json
{
  "timestamp": "2026-01-01T12:00:00.000Z",
  "level": "warn",
  "event": "BOOKING_CONFLICT",
  "hashedUserId": "sha256:a1b2c3d4e5f6g7h8",
  "cabinId": 123,
  "startDate": "2026-01-15",
  "endDate": "2026-01-18",
  "requestId": "req_abc12345",
  "responseTimeMs": 45,
  "cabinAvailability": "appeared_available",
  "errorDetail": "23P01:bookings_no_overlap"
}
```

## PII 方針

| フィールド | 記録可否 | 理由 |
|-----------|---------|------|
| guestId | 不可 | 直接的なユーザー識別子 |
| email | 不可 | PII |
| hashedUserId | 可 | SHA-256 ハッシュで逆変換不可 |
| cabinId | 可 | システム内部 ID |
| requestId | 可 | リクエスト追跡用 |

## 受入基準

- [x] `logger.bookingConflict()` で構造化ログが出力される
- [x] hashedUserId が SHA-256 先頭 16 文字形式で出力される
- [x] 本番環境で HASH_SALT 未設定時にエラーが発生する
- [x] requestId が一意に生成される
- [x] responseTimeMs がミリ秒単位で記録される
- [x] ユニットテストが通過する

## 影響範囲

| ファイル | 変更内容 |
|---------|---------|
| app/_lib/logger.ts | 新規作成（StructuredLogger クラス） |
| app/_lib/actions.ts | createBooking にログ統合 |
| tests/unit/logger.test.ts | ユニットテスト追加 |

## 関連ドキュメント

- [plan.md](plan.md) - 実装計画
- [tasks.md](tasks.md) - タスク一覧
- [specs/002-booking-concurrency-control/operations.md](../002-booking-concurrency-control/operations.md) - 運用ガイドライン
