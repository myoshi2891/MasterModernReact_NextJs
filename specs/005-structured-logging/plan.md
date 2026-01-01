# 005: 構造化ログ導入 - 実装計画

> Status: **完了**

## 実装ステップ

### Step 1: logger.ts 作成

1. `app/_lib/logger.ts` を新規作成
2. `LogLevel` 型定義（debug, info, warn, error）
3. `BookingConflictLogEntry` インターフェース定義
4. `hashUserId()` 関数実装（SHA-256、先頭 16 文字）
5. `generateRequestId()` 関数実装（UUID 先頭 8 文字）
6. `StructuredLogger` クラス実装

### Step 2: セキュリティ強化

1. 本番環境で HASH_SALT 未設定時にエラーをスロー
2. 開発環境用のデフォルト salt を設定
3. randomUUID のインポート修正

### Step 3: actions.ts 統合

1. `createBooking` に requestId 生成を追加
2. startTime で処理時間計測を開始
3. エラー発生時に `logger.bookingConflict()` を呼び出し
4. 23P01（EXCLUDE 違反）と 23505（UNIQUE 違反）で記録

### Step 4: テスト作成

1. `tests/unit/logger.test.ts` を作成
2. hashUserId のテスト
3. generateRequestId のテスト
4. bookingConflict のテスト

## 変更ファイル一覧

| ファイル | 変更種別 | 内容 |
|---------|---------|------|
| app/_lib/logger.ts | 新規 | StructuredLogger クラス |
| app/_lib/actions.ts | 修正 | ログ統合 |
| tests/unit/logger.test.ts | 新規 | ユニットテスト |

## 設計判断

### hashedUserId の設計

- **目的**: ログ相関分析（同一ユーザーの連続 409 検出）
- **方式**: SHA-256 + salt のハッシュ
- **長さ**: 先頭 16 文字（64 ビット）
- **理由**: 認証には使用しないため衝突許容、ログのコンパクト性

### HASH_SALT の要件

- 最低 32 バイト以上のランダム値
- 環境変数で管理
- 本番環境では必須

## 検証項目

- [x] ローカル環境でログ出力を確認
- [x] ユニットテストが通過
- [x] 型チェックが通過
- [x] lint が通過