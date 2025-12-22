# Plan: 予約の同時実行対策（重複予約防止とDB整合性）

## アーキテクチャ方針
- **DB制約が唯一の真実**として、重複予約の防止を保証する。
- アプリ側は **事前チェック**を行ってもよいが、最終的な拒否は DB 制約に委ねる。
- RLS は認可用途に限定し、同時実行対策は DB の排他制約で担保する。
- `startDate`/`endDate` は **[startDate, endDate)** として扱う。

## 変更範囲（想定）
### DB / Migration
- `bookings` テーブルに排他制約（EXCLUDE USING gist）
- `bookings` テーブルにチェック制約（startDate < endDate, numGuests >= 1）
- キャパシティチェック用トリガー
- 任意で `clientRequestId` 列 + unique index

### サーバーアクション
- `createBooking`:
  - DB 制約違反のエラーコードを解釈し 409/400 に変換
  - `clientRequestId` を受け取り insert（任意）
  - 競合時の再選択を促す安全なメッセージを返す

### エラー表示
- UI は既存のエラーバナー/メッセージで十分
- 文言例: 「選択した日程はすでに予約されています。別の日程を選択してください。」

## 実装前の確認
1. `startDate`/`endDate` の型確認（`timestamptz` or `date`）
2. `status` の実値確認とキャンセル値の確定
3. 既存データの重複/逆転検出の実行

## データ移行
1. 事前検査SQLで重複/逆転を洗い出し
2. **自動クリーンアップスクリプト**で整理（手動運用は避ける）
3. dry-run で影響範囲を確認
4. `btree_gist` 拡張の有効化
5. チェック制約・排他制約・トリガーの適用
6. ロールバック手順を事前に用意

## 実装詳細（DB）
- SQL 定義は `specs/002-booking-concurrency-control/spec.md` の **DB設計**を参照
- `startDate`/`endDate` の型に応じて `tstzrange` or `daterange` を選択
- トリガーは `P0001` + `CAPACITY_EXCEEDED` などのコードを使用

## エラーマッピング
- `23P01` → 409 Conflict（予約日程が重複）
- `23514` → 400 Bad Request（日付順序/人数不正）
- `23505` → 409 Conflict（二重送信）
- `P0001` → 400/404（CAPACITY_EXCEEDED / CABIN_NOT_FOUND）
- 想定外エラーは 500 とし、内部ログで原因を追跡

## テスト計画（実装時）
- **DB統合テスト**（ローカル Supabase）
  - 同一キャビン/同日程の insert を並列で実行し、片方が 409 になる
  - `status = 'canceled'` の場合は重複を許容
  - `numGuests > maxCapacity` で拒否される
  - idempotency key の重複で 409 を返す
- **ユニットテスト**
  - エラーコードが適切に 400/409 に変換される

## 監視 / 監査
- 409 を集計し、ピーク時の競合率を測定
- 予約失敗時の `cabinId` と期間を匿名化して記録
- 409率 > 5%: 先読みチェックの追加を検討
- 409率 > 20%: システム異常の可能性として調査
- 重大障害時に制約を一時無効化する手順を用意

## ロールバック手順（想定）
1. `drop trigger if exists bookings_capacity_check on bookings;`
2. `drop function if exists check_booking_capacity();`
3. `alter table bookings drop constraint if exists bookings_no_overlap;`
4. `alter table bookings drop constraint if exists bookings_date_order;`
5. `alter table bookings drop constraint if exists bookings_num_guests;`
6. `drop index if exists bookings_request_id_unique;`
7. `alter table bookings drop column if exists clientRequestId;`

## ロールアウト
1. Staging へ Migration 適用
2. ローカル/ステージングで並列予約テスト
3. Production 適用（短時間メンテナンス推奨）

## 見積
- 設計: 1 日
- 実装: 1.5 日
- 検証・移行: 1〜1.5 日
- 合計: 3〜4 日（バッファ込み）
