# Plan 003: data-service のクエリ効率を改善し死コードを除去する

> **Executor instructions**: このプランをステップ順に実行すること。各ステップの
> 検証コマンドを実行し、期待結果を確認してから次に進むこと。「STOP conditions」
> のいずれかが発生したら、中断して報告すること。完了したら `plans/README.md` の
> 該当ステータス行を更新すること。
>
> **Drift check (run first)**: `git diff --stat 5457faa..HEAD -- "app/_lib/data-service.ts" "app/_lib/actions.ts" "app/_components/Reservation.tsx" "tests/unit/"`
> in-scope ファイルに変更があれば、「Current state」の抜粋と実コードを突き合わせ、
> 不一致があれば STOP condition として扱うこと。

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED（認可ロジックのクエリ変更を含むため）
- **Depends on**: plans/002-critical-path-test-coverage.md（characterization
  テストを先に敷くこと）
- **Category**: perf
- **Planned at**: commit `5457faa`, 2026-07-04

## Why this matters

キャビン詳細ページは1リクエスト中に同一の `getCabin()` を2回（generateMetadata と
Page 本体）実行し、日付ピッカーは予約行の**全カラム**（他ゲストの PII を含む）を
取得して2フィールドしか使わない。さらに予約の更新/削除は、1行の所有権確認のために
**ゲストの全予約履歴＋cabins join** を毎回フェッチする。いずれも修正は小さく、
DB 往復と不要なデータ転送を確実に減らす。あわせて同ファイル内のチュートリアル
時代の死コード（約64行のコメントアウト CRUD と未使用 export）を除去する。

## Current state

関連ファイル:

- `app/_lib/data-service.ts` — 全フェッチャ。`cacheFn`（React `cache` の
  フォールバック付きラッパ）が**243〜246行**に定義済みだが `getCountriesCached`
  にしか使われていない。`getCabin` は30行、`getSettings` は220行、
  `getBookedDatesByCabinId` は181行から始まる
- `app/_lib/actions.ts` — `updateBooking`（102〜107行）と `deleteBooking`
  （271〜274行）が所有権確認に `getBookings(guestId)` の全件フェッチを使う
- `app/_components/Reservation.tsx` — 22〜27行で `Promise.all` の**後に**
  `auth()` を直列 await している
- `app/cabins/[cabinId]/page.tsx` — 30行（generateMetadata）と63行（Page）が
  同一リクエスト内で `getCabin(cabinId)` を各1回呼ぶ

現状コード抜粋（すべて実読で確認済み）:

`app/_lib/data-service.ts` 30〜35行:

```ts
export async function getCabin(id: number | string): Promise<Cabin> {
  const { data, error } = await supabaseServer
    .from("cabins")
    .select("*")
    .eq("id", id)
    .single();
```

同 191〜195行（`getBookedDatesByCabinId` 内、全カラム取得 → 使うのは
`startDate` / `endDate` のみ）:

```ts
const { data, error } = await supabaseServer
  .from("bookings")
  .select("*")
  .eq("cabinId", cabinId)
  .or(`startDate.gte.${todayISO},status.eq.checked-in`);
```

同 243〜246行（既存の `cacheFn` — これを再利用する）:

```ts
const cacheFn =
  typeof cache === "function"
    ? cache
    : <T extends (...args: never[]) => unknown>(fn: T) => fn;
```

同 325〜390行: `/* ... */` でコメントアウトされた旧 `createBooking` /
`updateGuest` / `updateBooking` / `deleteBooking`（未定義の `supabase` を参照する
チュートリアル時代のコード）。現行実装は `app/_lib/actions.ts` にある。

同 57〜72行: `getCabinPrice` — `app/` / `tests/` に呼び出し元ゼロの未使用 export。

`app/_lib/actions.ts` 102〜107行（`updateBooking` の所有権確認 — 全件フェッチ）:

```ts
const guestBookings = await getBookings(guestId);
const booking = guestBookings.find((item) => item.id === bookingId);

if (!booking) {
  throw new Error("You are not allowed to update this booking.");
}
```

`app/_components/Reservation.tsx` 22〜27行:

```tsx
const [settings, bookedDates] = await Promise.all([
  getSettings(),
  getBookedDatesByCabinId(cabin.id),
]);

const session = await auth();
```

リポジトリ規約: TypeScript strict、`as` 二重キャスト回避、既存の
`getBookings` の select 絞り込み（`data-service.ts:167-168`）が列挙パターンの
exemplar。TDD 必須サイクル（`.claude/rules/tdd-mandatory-cycle.md`）に従い
Red → Green でコミット分割。

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Install   | `bun install`            | exit 0              |
| Typecheck | `bun run typecheck`      | exit 0              |
| Unit      | `bun run test:unit`      | 全テストパス          |
| Component | `bun run test:component` | 全テストパス          |
| Lint      | `bun run lint`           | exit 0              |
| Build     | `bun run build`          | exit 0              |

## Steps

### Step 1: 死コード除去（リファクタリングのみ、テスト追加不要）

1. `app/_lib/data-service.ts` 325〜390行のコメントアウトブロック
   （`/* export async function createBooking ... */` から末尾の `*/` まで）と
   直前の `/////////////` セクションバナーを削除
2. `getCabinPrice`（57〜72行）と、それだけが使う `CabinPrice` インターフェース
   （22〜25行）を削除。事前確認: `grep -rn "getCabinPrice\|CabinPrice" app/ tests/`
   の結果が data-service.ts 自身のみであること。**他に参照があれば削除せず STOP**

検証: `bun run test:unit && bun run typecheck && bun run lint` → 全パス。
コミット: `refactor(data-service): remove tutorial-era dead code and unused export`

### Step 2 (Red→Green): リクエストスコープキャッシュ

1. Red: `tests/unit/data-service.test.ts` に「`getCabin` を同一引数で2回呼んでも
   supabase クエリが1回しか発行されない」テストを追加。
   注意: `cacheFn` はテスト環境で React `cache` が使えない場合 identity にフォール
   バックする。テストで `react` の `cache` をモック（メモ化する簡易実装）するか、
   それが困難なら「`getCabin` が `cacheFn` でラップされている」ことを検証する
   代替（後述の grep done criteria）に切り替えて、テストは通常の挙動
   （データ取得・notFound）の回帰確認に留めてよい
2. Green: `getCabin` と `getSettings` を `cacheFn` でラップする。`cacheFn` の
   定義（243〜246行）は**ファイル先頭付近（import 直後）へ移動**し、定義より
   前に使用しないこと。形式は `getCountriesCached`（248行）を踏襲:

```ts
export const getCabin = cacheFn(async (id: number | string): Promise<Cabin> => {
  // 既存ボディをそのまま移す
});
```

`getSettings` も同形式。**関数のシグネチャ・エラー挙動（`notFound()` / throw）は
一切変えない**こと。

検証: `bun run test:unit && bun run test:component && bun run typecheck` → 全パス。
コミット: `test(data-service): add failing spec for request-scoped caching`（Red）
→ `feat(data-service): wrap getCabin/getSettings in request-scoped cache`（Green）

### Step 3 (Red→Green): `getBookedDatesByCabinId` の select 絞り込み

1. Red: 既存テスト（`tests/unit/data-service.test.ts` の
   `getBookedDatesByCabinId`）に「select が `"startDate, endDate"` で呼ばれる」
   アサーションを追加 → 失敗を確認
2. Green: `data-service.ts` の `.select("*")` を `.select("startDate, endDate")`
   に変更（191〜195行）。後続の map は `startDate` / `endDate` のみ参照している
   ため他の変更は不要

検証: `bun run test:unit` → 全パス。
コミット: `test(data-service): expect narrowed select for booked dates`（Red）
→ `fix(data-service): narrow booked-dates query to date fields`（Green）

### Step 4 (Red→Green): 所有権確認をターゲットクエリ化

1. Red: `tests/unit/actions.test.ts` の `updateBooking` / `deleteBooking` テストを
   新実装の期待に更新する。現在のテストは `getBookings` モックに依存している
   （71〜77行の `vi.mock`）ので、新たに data-service に追加する
   `getBookingOwnership`（下記）をモックする形へ書き換え → 失敗を確認
2. Green: `app/_lib/data-service.ts` に所有権確認専用フェッチャを追加:

```ts
export interface BookingOwnership {
  id: number;
  guestId: number;
  cabins: Pick<Cabin, "maxCapacity"> | null;
}

export async function getBookingOwnership(
  bookingId: number,
  guestId: number
): Promise<BookingOwnership | null> {
  const { data, error } = await supabaseServer
    .from("bookings")
    .select("id, guestId, cabins(maxCapacity)")
    .eq("id", bookingId)
    .eq("guestId", guestId)
    .maybeSingle();

  if (error) {
    console.error(error);
    throw new Error("Bookings could not get loaded");
  }
  return (data as BookingOwnership | null) ?? null;
}
```

3. `actions.ts` の `updateBooking`: `getBookings` + `.find` を
   `getBookingOwnership(bookingId, guestId)` に置換。`null` なら従来どおり
   `"You are not allowed to update this booking."` を throw。
   `maxCapacity` は `booking.cabins?.maxCapacity` から従来どおり取得
4. `actions.ts` の `deleteBooking`: 同様に置換（`null` →
   `"You are not allowed to delete this booking."`）。エラーメッセージ文字列は
   **一字も変えない**（テスト・UI 文言が依存）
5. `getBookings` 自体は残す（reservations 一覧ページが使用）

検証: `bun run test:unit && bun run typecheck` → 全パス。
コミット: `test(actions): expect targeted ownership query`（Red）→
`feat(actions): authorize booking mutations with targeted query`（Green）

### Step 5: `Reservation.tsx` の直列 auth を並列化

`app/_components/Reservation.tsx` 22〜27行を:

```tsx
const [settings, bookedDates, session] = await Promise.all([
  getSettings(),
  getBookedDatesByCabinId(cabin.id),
  auth(),
]);
```

に変更（後続の `session?.user` 分岐は不変）。component テストの回帰を確認。

検証: `bun run test:component && bun run build && bun run lint` → 全パス。
コミット: `refactor(reservation): parallelize auth with data fetches`

## Hard boundaries

- **In scope**: `app/_lib/data-service.ts`、`app/_lib/actions.ts`（所有権確認
  2箇所のみ）、`app/_components/Reservation.tsx`（22〜27行のみ）、
  `tests/unit/data-service.test.ts`、`tests/unit/actions.test.ts`
- **Out of scope**: `getBooking` の `select("*")`（Plan 001 が同関数の返り値
  `guestId` に依存するため絞り込み禁止）、`getBookings` のページネーション
  （別所見 PERF-05、対象外）、`app/cabins/[cabinId]/page.tsx`（変更不要 —
  キャッシュ化だけで重複が解消する）、`getBookings` の型キャスト改善
  （別所見 TECHDEBT-05）、その他のコンポーネント

## Done criteria（機械検証可能）

- `bun run test:unit` / `bun run test:component` — 全パス
- `bun run typecheck` / `bun run lint` / `bun run build` — exit 0
- `grep -c "getCabinPrice" app/_lib/data-service.ts` — 0
- `grep -n "select(\"\\*\")" app/_lib/data-service.ts` — `getBookedDatesByCabinId`
  内に該当なし（`getCabin` / `getSettings` / `getGuest` / `getBooking` の
  `select("*")` は残ってよい）
- `grep -n "getBookings" app/_lib/actions.ts` — 0件（import からも消えている）
- `grep -c "cacheFn(" app/_lib/data-service.ts` — 3以上（getCabin, getSettings,
  getCountriesCached）

## Test plan

Steps 2〜4 に記載。パターン元: `tests/unit/data-service.test.ts` の supabase
チェーンモック、`tests/unit/actions.test.ts` の `vi.hoisted` モック基盤。
Plan 002 で追加されたテストが回帰検知網として機能する前提。

## Maintenance note

- `getBookingOwnership` は認可専用。将来のミューテーション追加時もこれを使うこと
- `cacheFn` ラップはリクエストスコープのみ。リクエスト横断キャッシュ
  （Cache Components）は Plan 005 のスパイクで別途検討
- Supabase の `maybeSingle()` は行が無いとき error ではなく `data: null` を返す —
  この前提が SDK メジャーアップデートで変わらないか注視

## STOP conditions

- Plan 002 が未完了（`tests/unit/auth.test.ts` が存在しない）場合 → STOP し、
  依存順序を報告
- `maybeSingle()` が現行 `@supabase/supabase-js` に存在しない場合 → STOP
  （`.single()` + エラーコード分岐への変更は認可セマンティクスに影響するため
  勝手に代替しない）
- Step 4 で `cabins(maxCapacity)` join が配列で返る等、型が excerpt と一致しない
  場合 → STOP して実際のレスポンス形を報告
- component テストが3件以上落ちる場合 → STOP
