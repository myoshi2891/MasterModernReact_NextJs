# Plan 001: 予約編集ページに所有権チェックを追加し IDOR を解消する

> **Executor instructions**: このプランをステップ順に実行すること。各ステップの
> 検証コマンドを実行し、期待結果を確認してから次に進むこと。「STOP conditions」
> のいずれかが発生したら、中断して報告すること — 独自判断で回避しないこと。
> 完了したら `plans/README.md` の該当ステータス行を更新すること。
>
> **Drift check (run first)**: `git diff --stat 5457faa..HEAD -- "app/account/reservations/edit/" "app/_lib/data-service.ts" "tests/unit/"`
> in-scope ファイルに変更があれば、「Current state」の抜粋と実コードを突き合わせ、
> 不一致があれば STOP condition として扱うこと。

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: security
- **Planned at**: commit `5457faa`, 2026-07-04

## Why this matters

予約編集ページ `app/account/reservations/edit/[bookingId]/page.tsx` は、URL の
`bookingId` をそのまま `getBooking()` に渡しており、`auth()` 呼び出しも所有権
チェックも存在しない。`getBooking()` は service-role クライアント（RLS バイパス）
で任意の予約行を返すため、**ログイン済みの任意のゲストが URL の数値を変えるだけで
他人の予約情報（人数・自由記述の observations・キャビン/滞在情報）を閲覧できる**
（IDOR / 水平権限昇格）。書き込み側（`updateBooking` Server Action）には所有権
チェックが既にあるため、漏れているのは読み取りパスのみ。修正は追加的なガードで、
本来ブロックされるべきアクセスだけを遮断する。

## Current state

関連ファイルと役割:

- `app/account/reservations/edit/[bookingId]/page.tsx` — 予約編集ページ。
  認可チェックなしに `getBooking(bookingId)` を呼ぶ（脆弱箇所）
- `app/_lib/data-service.ts` — `getBooking()`（118〜137行付近）。id のみで
  予約行＋cabins join を返す。返り値の `BookingWithCabin` は `Booking` を継承
  しており **`guestId` フィールドを含む**
- `app/_lib/actions.ts` — `updateBooking()`（102〜107行付近）に所有権チェックの
  既存パターンがある
- `middleware.ts` — `/account/*` の**認証**は保護するが**認可**はしない

現状コード（`app/account/reservations/edit/[bookingId]/page.tsx` 22〜36行）:

```tsx
export default async function Page({ params }: PageProps) {
  const { bookingId } = await params;
  let booking;

  try {
    booking = await getBooking(bookingId);
  } catch (error) {
    console.error(`Failed to load booking ${bookingId}:`, error);
    throw new Error(`Failed to load booking. Booking ID: ${bookingId}`);
  }

  // nullセーフな値の取得
  const numGuests = booking?.numGuests ?? 1;
  const observations = booking?.observations ?? "";
  const maxCapacity = booking?.cabins?.maxCapacity ?? 4;
```

参照すべき既存の所有権チェックパターン（`app/_lib/actions.ts` 86〜107行、抜粋）:

```ts
export async function updateBooking(formData: FormData): Promise<void> {
  const bookingId = Number(formData.get("bookingId"));
  const session = await auth();
  if (!session) {
    throw new Error("You must be logged in");
  }
  const guestId = session.user?.guestId;
  if (!guestId) {
    throw new Error("You must be logged in");
  }
  // ...
  const guestBookings = await getBookings(guestId);
  const booking = guestBookings.find((item) => item.id === bookingId);

  if (!booking) {
    throw new Error("You are not allowed to update this booking.");
  }
```

リポジトリ規約:

- TypeScript strict。`any` 禁止、`as` の乱用禁止
- ユニットテストは `tests/unit/actions.test.ts` の `vi.hoisted()` + `vi.mock()`
  パターンに従う（同ファイル 16〜89行が exemplar）
- TDD 必須サイクル（`.claude/rules/tdd-mandatory-cycle.md`）: 失敗するテストを
  先にコミット（Red）→ 実装（Green）→ リファクタ、の順でコミットを分割すること

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Install   | `bun install`            | exit 0              |
| Typecheck | `bun run typecheck`      | exit 0, エラーなし   |
| Unit      | `bun run test:unit`      | 全テストパス          |
| Component | `bun run test:component` | 全テストパス          |
| Lint      | `bun run lint`           | exit 0              |
| Build     | `bun run build`          | exit 0              |

## Steps

### Step 1 (Red): 所有権チェックの失敗テストを追加

`tests/unit/reservation-edit-page.test.ts` を新規作成する。
`tests/unit/actions.test.ts` のモックパターン（`vi.hoisted` で mock を定義し、
`vi.mock("../../app/_lib/auth", ...)` / `vi.mock("../../app/_lib/data-service", ...)`
で差し替える）に従い、以下のケースを書く:

1. セッションの `guestId` と `booking.guestId` が**一致しない**場合、
   `notFound()`（`next/navigation` をモック）が呼ばれること
2. セッションが `null`、または `session.user.guestId` が `undefined` の場合も
   `notFound()` が呼ばれること
3. 一致する場合はページ要素（React 要素）が返り、`notFound()` が呼ばれないこと

ページはデフォルトエクスポートの async 関数なので、
`await Page({ params: Promise.resolve({ bookingId: "7" }) })` の形で直接呼べる。
`next/navigation` の `notFound` は throw する実装としてモックし、
`expect(...).rejects.toThrow()` で検証してよい。

検証: `bun run test:unit` → 新規テストが**失敗**すること（現状は所有権チェックが
ないため case 1, 2 が落ちる）。

コミット: `test(security): add failing spec for reservation edit ownership check`

### Step 2 (Green): ページに認可ガードを実装

`app/account/reservations/edit/[bookingId]/page.tsx` を修正する:

1. `import { auth } from "@/app/_lib/auth";` と
   `import { notFound } from "next/navigation";` を追加
2. `getBooking()` 呼び出しの**前**にセッションを取得:

```tsx
const session = await auth();
const guestId = session?.user?.guestId;
if (!guestId) {
  notFound();
}
```

3. `getBooking()` 成功後、所有権を検証:

```tsx
if (booking.guestId !== guestId) {
  notFound();
}
```

注意: 既存の `try/catch`・フォーム描画部分は変更しないこと。エラーメッセージに
所有者情報を含めないこと（`notFound()` で 404 を返すだけにする — 予約の存在有無を
攻撃者に開示しない）。

検証: `bun run test:unit` → 全パス。`bun run typecheck` → exit 0。

コミット: `fix(security): enforce booking ownership on reservation edit page`

### Step 3 (Refactor + 全体検証)

`bun run lint` と `bun run build` を実行し、問題があれば修正する。
既存の component テスト（`bun run test:component`）が回帰していないことを確認。

コミット（修正があった場合のみ）: `refactor(security): clean up edit page guard`

## Hard boundaries

- **In scope**: `app/account/reservations/edit/[bookingId]/page.tsx`、
  `tests/unit/reservation-edit-page.test.ts`（新規）
- **Out of scope**: `app/_lib/data-service.ts`（`getBooking` のシグネチャ変更禁止 —
  guestId スコープ版の追加は Plan 003 の領域と重なるため行わない）、
  `middleware.ts`、`app/_lib/actions.ts`、他のページ

## Done criteria（機械検証可能）

- `bun run test:unit` — 全パス（新規テスト含む）
- `bun run typecheck` — exit 0
- `bun run lint` — exit 0
- `bun run build` — exit 0
- `grep -n "auth()" -- 'app/account/reservations/edit/[bookingId]/page.tsx'` — 1件以上
- `grep -n "notFound" -- 'app/account/reservations/edit/[bookingId]/page.tsx'` — 1件以上

## Test plan

上記 Step 1 の3ケース。パターン元: `tests/unit/actions.test.ts` の
`updateBooking` テスト群（所有権拒否ケースの書き方）。

## Maintenance note

今後 `/account` 配下に予約 ID を受け取る読み取りページを追加する場合は、必ず
同じ所有権チェックを入れること。レビュー観点はプロジェクト憲法
（`.specify/memory/constitution.md`「認可チェック: guestId の検証漏れ」）に既載。

## STOP conditions

- `BookingWithCabin` に `guestId` が存在しない（型エラーになる）場合 → STOP。
  `types/domain.ts` の `Booking` 型を確認して報告すること
- 既存テストが Step 2 の変更で3件以上落ちる場合 → STOP（想定外の結合がある）
- ページが Client Component 化されている等、Current state と構造が異なる場合 → STOP
