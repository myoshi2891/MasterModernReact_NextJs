# Tasks: 予約の同時実行対策（重複予約防止とDB整合性）

## タスク分解
- [ ] `startDate`/`endDate` の型確認（`specs/002-booking-concurrency-control/spec.md` の「startDate/endDate の型確認」SQLを実行し、結果を `specs/002-booking-concurrency-control/plan.md` の「実装前の確認」に記録）
- [ ] `status` の実値確認と「キャンセル値」の確定（`specs/002-booking-concurrency-control/spec.md` の「status の実値確認」SQLを実行し、結果を `specs/002-booking-concurrency-control/plan.md` の「実装前の確認」に記録）
- [ ] 既存データの重複/不整合チェック（SQL で事前確認）
- [ ] 重複・逆転データのクリーンアップ方針を決定
- [ ] 自動クリーンアップSQLの作成とdry-run（`specs/002-booking-concurrency-control/spec.md` の「事前クリーンアップSQL（例）」をベースに dry-run を実行し、ログを `specs/002-booking-concurrency-control/plan.md` の「データ移行」に記録）
- [ ] DB Migration 作成（排他制約 + チェック制約 + トリガー）
- [ ] migration 適用順序とロールバック手順の確定
- [ ] トリガー例外の SQLSTATE を決定（P0001 + メッセージ）
- [ ] `createBooking` のエラーコード変換（23P01/23514/23505/P0001）
- [ ] idempotency key の導入可否を決定（生成元/NULL許容/伝播方法を明記）
- [ ] ローカル Supabase で並列予約テストを実施
- [ ] パフォーマンス影響の計測（ステージングで GiST 適用前/後の INSERT/UPDATE 遅延を計測し、index サイズ/予約が 100〜200 バイト目安内か確認、予約 1 万件規模でクエリ/スループットを計測。結果は `specs/002-booking-concurrency-control/spec.md` の「パフォーマンス考慮」に記録）
- [ ] 監視・ログの文言を定義（PII なし）
- [ ] 409 連発時の運用判断基準（混雑/システム異常）を整理

## 依存関係
- Supabase ローカル環境 or ステージング環境
- `bookings` / `cabins` テーブルスキーマの確定

## 見積
- 設計 1 日
- 実装 1.5 日
- 検証・移行 1〜1.5 日
- 合計 3〜4 日

## テスト観点（実装時）
- [ ] 同一キャビン/同日程の並列予約で片方が 409
- [ ] `status = canceled` の予約がある場合、重複が許容される
- [ ] `startDate >= endDate` で 400
- [ ] `numGuests = 0` で 400
- [ ] `numGuests > maxCapacity` で拒否される
- [ ] idempotency key の重複で 409
- [ ] CAPACITY_EXCEEDED の P0001 が 400 に変換される

## 完了定義
- DB 制約により重複予約が必ず拒否される
- 競合時に 409 が返る
- 既存テストが全て通る
- ロールバック手順がドキュメント化されている
