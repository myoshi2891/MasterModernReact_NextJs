# Spec: 予約の同時実行対策（重複予約防止とDB整合性）

## 背景 / 目的
- 予約作成が同時実行された場合、同一キャビン・同一日程の重複予約が発生し得る。
- 現状はアプリケーション側の検証のみで、並行実行やリトライに耐えられない。
- DB側で**強制制約**を持たせ、同時実行でも破れない重複防止を実現する。

## ゴール
- DB制約で**重複予約を物理的に拒否**できる
- 競合時のレスポンスが **409 Conflict** で統一される
- 予約入力の整合性が DB でも担保される
- 二重送信（リトライ/連打）の再実行が安全になる

## 非ゴール
- UI/UXの大幅な刷新（文言調整程度は可）
- 決済や課金の整合性設計
- Supabase Auth への全面移行
- 予約料金ロジックの全面改修

## 前提 / 制約
- Next.js 14 App Router + Supabase（Postgres）
- 予約作成は server action で実行される
- 現状は **service-role** で DB にアクセスしており RLS をバイパスする
- 日付レンジは **[startDate, endDate)**（チェックアウト日は空ける）

## 実装前の確認事項（必須）
### startDate/endDate の型確認
```
select column_name, data_type
from information_schema.columns
where table_name = 'bookings'
  and column_name in ('startDate', 'endDate');
```
- `timestamptz` の場合: `tstzrange(startDate, endDate, '[)')`
- `date` の場合: `daterange(startDate, endDate, '[)')`

### status の実値確認
```
select distinct status
from bookings
order by status;
```
- 実値に合わせて「キャンセル扱いの値」を確定する
- 必要なら `status` のチェック制約/ENUM を導入する

## 用語 / データモデル
- `bookings`: 予約レコード
  - `cabinId` (FK)
  - `guestId` (FK)
  - `startDate`, `endDate`（日付またはタイムスタンプ）
  - `numGuests`
  - `status`: 実データ確認後に確定（例: `unconfirmed`, `checked-in`, `checked-out`, `canceled`）
- `cabins`: `maxCapacity`, `regularPrice`, `discount`

## 現状の問題
- 予約の重複チェックはアプリ側のみで、**並列 insert に弱い**
- DBに排他制約がないため、レース条件で**重複予約**が発生し得る
- 二重送信や自動リトライで重複レコードが入り得る

## 要件
### 機能要件
1. 同一キャビンで **予約期間が重なる**予約は作成不可
   - `status = 'canceled'` は重複判定から除外
2. `startDate < endDate` を満たす
3. `numGuests >= 1` を満たす
4. `numGuests <= cabins.maxCapacity` を満たす
5. 競合時は 409 Conflict を返す
6. 二重送信を **idempotency key** で抑止可能にする

### 非機能要件
- 同時実行に強いこと（DB制約で保証）
- エラー応答は PII を含まないこと
- 既存データの破壊的変更を伴わないこと

## 設計オプション
### Option A: DB排他制約（推奨）
- Postgres の **EXCLUDE USING gist** で日付レンジの重複を禁止
- 最も堅牢で、同時実行に強い

### Option B: アドバイザリロック
- `pg_advisory_xact_lock(cabinId)` で予約作成を直列化
- DB制約より柔軟だが、実装ミスや外部ツール操作に弱い

### Option C: 予約カレンダー用集約テーブル
- 1日単位の予約テーブルに分解して unique 制約を張る
- データ量が増えるが、集計や可視化には強い

**選定:** Option A を採用。必要に応じて idempotency key を追加。

## DB設計（詳細）
### 1. 排他制約（重複予約防止）
```
create extension if not exists btree_gist;

-- timestamptz の場合
alter table bookings
  add constraint bookings_no_overlap
  exclude using gist (
    cabinId with =,
    tstzrange(startDate, endDate, '[)') with &&
  )
  where (status <> 'canceled');

-- date の場合
alter table bookings
  add constraint bookings_no_overlap
  exclude using gist (
    cabinId with =,
    daterange(startDate, endDate, '[)') with &&
  )
  where (status <> 'canceled');
```
- `[)` により、チェックアウト日と次のチェックイン日が同日でも許容
- 日付型に応じて `tstzrange` か `daterange` を選択
- 競合エラーコード: `23P01`（exclusion violation）

### 2. チェック制約（基本整合性）
```
alter table bookings
  add constraint bookings_date_order check (startDate < endDate);

alter table bookings
  add constraint bookings_num_guests check (numGuests >= 1);
```
- エラーコード: `23514`（check violation）

### 2.5 status チェック（任意）
```
alter table bookings
  add constraint bookings_status_check
  check (status in ('unconfirmed', 'checked-in', 'checked-out', 'canceled'));
```
- 実データの確認後に有効化する
- エラーコード: `23514`（check violation）

### 3. キャパシティチェック（トリガー）
```
create or replace function check_booking_capacity()
returns trigger as $$
declare max_cap int;
begin
  select maxCapacity into max_cap from cabins where id = new.cabinId;
  if max_cap is null then
    raise exception using errcode = 'P0001', message = 'CABIN_NOT_FOUND';
  end if;
  if new.numGuests > max_cap then
    raise exception using errcode = 'P0001', message = 'CAPACITY_EXCEEDED';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger bookings_capacity_check
before insert or update on bookings
for each row execute function check_booking_capacity();
```
- `update` で人数変更を許可する場合も防御できる

### 4. idempotency key（任意）
```
alter table bookings add column clientRequestId uuid;
create unique index bookings_request_id_unique
  on bookings (clientRequestId)
  where clientRequestId is not null;
```
- 二重送信は `23505`（unique violation）で検出可能
- 必要なら `(guestId, clientRequestId)` の複合 unique も選択肢
- 生成元は **クライアント**（例: `crypto.randomUUID()`）とし、同一予約試行中は値を保持する
- server action は `clientRequestId` を必須パラメータとして受け取る設計が望ましい
- 予約完了または日付変更時に新しい `clientRequestId` を再生成する
- UUIDの衝突は現実的に無視できるため、TTLは必須ではない

## アプリ側のエラーマッピング
| SQLSTATE | 原因 | HTTP | 返却メッセージ例 |
| --- | --- | --- | --- |
| 23P01 | 予約期間の重複 | 409 | 選択日程は既に予約されています |
| 23514 | 日付順序/人数不正 | 400 | 入力内容に誤りがあります |
| 23505 | clientRequestId 重複 | 409 | 既に処理済みのリクエストです |
| P0001 | CAPACITY_EXCEEDED | 400 | 定員を超えています |
| P0001 | CABIN_NOT_FOUND | 404 | キャビンが見つかりません |

## RLS（認可）の方針
- **service-role では RLS は無効**。重複予約対策は DB 制約で担保する。
- 将来的に RLS を有効化する場合:
- NextAuth v4 の JWT に `guestId` を埋め込み
  - Supabaseに渡すトークンに custom claims を含める
  - policy 例:
```
create policy "bookings_select_own"
on bookings for select
using ((current_setting('request.jwt.claims', true)::jsonb ->> 'guestId')::int = guestId);
```

## エラーハンドリング指針
- Supabase error の `code` を判定
- `code = 'P0001'` の場合は `message` を判定して CAPACITY_EXCEEDED / CABIN_NOT_FOUND を切り分ける
- PII を含む詳細はログに残さない
- クライアントにはユーザー向けメッセージのみ返す

## 予約作成フロー（高レベル）
1. server action が `startDate`, `endDate`, `numGuests` を受け取る
2. DBから `cabins.maxCapacity/regularPrice/discount` を取得
3. サーバー側で `numNights` と `cabinPrice` を再計算
4. insert を実行し、DB制約により競合/不正値を検出
5. DBエラーコードを HTTP に変換し返却

## パフォーマンス考慮
- GiST index は書き込み時に追加オーバーヘッドが発生する
- 目安: 予約件数 × 約100〜200バイトのインデックス容量（要計測）
- INSERT/UPDATE の遅延は数ms程度の増加が想定されるため、ステージングでベンチマークを実施する

## 受入基準
- 同一キャビン・同一期間の予約は DB で拒否される
- 競合時のレスポンスは 409 で返る
- 予約期間の逆転、人数不正は 400 で返る
- `status = 'canceled'` は重複判定から除外される
- 同一リクエスト ID の再送が重複予約にならない（導入時）

## 移行戦略
1. 既存予約の重複チェック（事前検査SQL）
2. 重複がある場合は**自動クリーンアップスクリプト**で整理（手動運用は避ける）
3. dry-run を実施して影響範囲を確認
4. 排他制約・チェック制約・トリガーを順次適用

## 事前検査SQL（例）
### 重複予約の検出
```
select b1.id as booking1, b2.id as booking2, b1.cabinId
from bookings b1
join bookings b2
  on b1.cabinId = b2.cabinId
 and b1.id < b2.id
 and tstzrange(b1.startDate, b1.endDate, '[)') &&
     tstzrange(b2.startDate, b2.endDate, '[)')
where b1.status <> 'canceled'
  and b2.status <> 'canceled';
```
- `date` 型の場合は `daterange` に置換する

### 日付の逆転検出
```
select id, cabinId, startDate, endDate
from bookings
where startDate >= endDate;
```

## 事前クリーンアップSQL（例）
```
-- 重複予約のうち、後から作成された方をキャンセル
with conflicts as (
  select b2.id
  from bookings b1
  join bookings b2
    on b1.cabinId = b2.cabinId
   and b1.id < b2.id
   and tstzrange(b1.startDate, b1.endDate, '[)') &&
       tstzrange(b2.startDate, b2.endDate, '[)')
  where b1.status <> 'canceled'
    and b2.status <> 'canceled'
)
update bookings
set status = 'canceled'
where id in (select id from conflicts);
```
- `date` 型の場合は `daterange` に置換する
- どちらをキャンセルするかのルールは業務要件に合わせて調整する

## ロールバック
- 排他制約・チェック制約・トリガーの DROP
- `clientRequestId` のカラム・index の削除（導入時）

## リスク
- 既存データに重複があると migration が失敗
- `startDate` / `endDate` の型によって SQL が変わる
- `status` の定義が曖昧だと誤判定が起きる

## オープンクエスチョン
- `status` の確定値（キャンセル判定の基準）
- `startDate`/`endDate` の型（date/timestamptz）
- 予約更新で日付変更を許可するか
