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

## データ移行
- 既存データが排他制約に違反していないか事前確認
- もし重複が存在する場合は、手動で status を `canceled` にするなどの救済策が必要

## 事前検査と移行手順
1. 重複予約検出SQLを実行
2. 異常データの修正（取消 or 日付修正）
3. `btree_gist` 拡張の有効化
4. チェック制約の追加
5. 排他制約の追加
6. トリガー作成
7. ロールバック手順を事前に用意

## 実装詳細（DB）
### 排他制約
```
create extension if not exists btree_gist;

alter table bookings
  add constraint bookings_no_overlap
  exclude using gist (
    cabinId with =,
    tstzrange(startDate, endDate, '[)') with &&
  )
  where (status <> 'canceled');
```

### チェック制約
```
alter table bookings
  add constraint bookings_date_order check (startDate < endDate);

alter table bookings
  add constraint bookings_num_guests check (numGuests >= 1);
```

### キャパシティトリガー
```
create or replace function check_booking_capacity()
returns trigger as $$
declare max_cap int;
begin
  select maxCapacity into max_cap from cabins where id = new.cabinId;
  if max_cap is null then
    raise exception 'Cabin not found';
  end if;
  if new.numGuests > max_cap then
    raise exception 'Number of guests exceeds cabin capacity';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger bookings_capacity_check
before insert or update on bookings
for each row execute function check_booking_capacity();
```

### idempotency key（任意）
```
alter table bookings add column clientRequestId uuid;
create unique index bookings_request_id_unique on bookings (clientRequestId);
```

## エラーマッピング
- `23P01` → 409 Conflict（予約日程が重複）
- `23514` → 400 Bad Request（日付順序/人数不正）
- `23505` → 409 Conflict（二重送信）
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

## 監視 / 可観測性
- 409 エラーの件数をログ/メトリクス化
- 大量に発生する場合は UI で先読みチェックの追加を検討
