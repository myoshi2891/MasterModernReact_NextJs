# Plan 002: 認証層・updateGuest・data-service のクリティカルパスにテストを追加する

> **Executor instructions**: このプランをステップ順に実行すること。各ステップの
> 検証コマンドを実行し、期待結果を確認してから次に進むこと。「STOP conditions」
> のいずれかが発生したら、中断して報告すること。完了したら `plans/README.md` の
> 該当ステータス行を更新すること。
>
> **Drift check (run first)**: `git diff --stat 5457faa..HEAD -- "app/_lib/" "tests/unit/"`
> in-scope ファイルに変更があれば、「Current state」の抜粋と実コードを突き合わせ、
> 不一致があれば STOP condition として扱うこと。

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none（Plan 003 より先に実施すること — 003 が変更するコードの
  characterization テストを先に敷く）
- **Category**: tests
- **Planned at**: commit `5457faa`, 2026-07-04

## Why this matters

すべての Server Action の認可は `session.user.guestId` に依存しているが、それを
生成する Auth.js コールバック（`jwt` / `session`）と guest 自動作成ロジックには
テストがゼロ。また PII を書き込む `updateGuest` アクション、認可とUIが依存する
`getBookings` 等のフェッチャも未テスト。ここが静かに壊れると**全アクションの
所有権チェックが無効化**されるか、PII 書き込みが破損する。Plan 003 はこれらの
ファイルを変更するため、先に characterization テストを敷いて回帰検知網を作る。

## Current state

テストの現状:

- `tests/unit/actions.test.ts` — `createBooking` / `updateBooking` /
  `deleteBooking` はカバー済み。**`updateGuest` は未カバー**
- `tests/unit/data-service.test.ts` — `getCabins` / `getCabin`（notFound パス）/
  `getBookedDatesByCabinId` / `getCountries` のみ。**`getBooking` / `getBookings` /
  `getSettings` / `getGuest` / `createGuest` は未カバー**
- `app/_lib/auth.ts` / `app/_lib/auth.config.ts` — **テストファイルが存在しない**

テスト対象コード（自分で開いて確認済みの抜粋）:

`app/_lib/actions.ts` 44〜72行 — `updateGuest`:

```ts
export async function updateGuest(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session) {
    throw new Error("You must be logged in");
  }

  const nationalIDRaw = normalizeNationalId(
    formData.get("nationalID")?.toString()
  );
  const nationalityField = formData.get("nationality")?.toString() ?? "";
  const [nationality = "", countryFlag = ""] = nationalityField.split("%");

  const updateData = {
    nationality: nationality || null,
    countryFlag: countryFlag || null,
    nationalID: nationalIDRaw || null,
  };

  const { error } = await supabaseServer
    .from("guests")
    .update(updateData)
    .eq("id", session.user.guestId);

  if (error) {
    throw new Error("Guest could not be updated");
  }

  revalidatePath("/account/profile");
}
```

`app/_lib/auth.ts` 15〜32行 — guest 自動作成（23505 = 一意制約違反の競合リトライ）:

```ts
async function getOrCreateGuestByEmail(
  email: string,
  name: string | null | undefined
): Promise<Guest> {
  const existing = await getGuest(email);
  if (existing) return existing;
  try {
    return await createGuest({ email, fullName: name ?? "" });
  } catch (error) {
    const dbError = error as DatabaseError;
    if (dbError?.code === "23505") {
      const createdByAnotherRequest = await getGuest(email);
      if (createdByAnotherRequest) return createdByAnotherRequest;
    }
    throw error;
  }
}
```

`app/_lib/auth.ts` 53〜87行 — `jwt` / `session` コールバック（要点）:

- `jwt`: `trigger === "signIn"` または `token.guestId === undefined` のとき
  `getOrCreateGuestByEmail` を呼び `token.guestId` に格納。失敗時は
  ハッシュ化メールでログ出力し **throw（fail-fast）**
- `session`: `token.guestId` が `number` のときのみ `session.user.guestId` へ
  コピー、`null`/`undefined` は `undefined` に変換

`app/_lib/data-service.ts` 308〜323行 — `createGuest` はエラー時に
`"Guest could not be created"` へラップしつつ **元エラーの `code` を保持**する
（この `code` 保持を auth.ts の 23505 分岐が前提にしている）。

リポジトリ規約（プランはこれに従うこと）:

- モックは `vi.hoisted()` で定義し `vi.mock()` で差し替える。exemplar:
  `tests/unit/actions.test.ts` 16〜89行
- data-service のモック手法は `tests/unit/data-service.test.ts` を踏襲
- AAA パターン（Arrange-Act-Assert）、正常系と異常系の両方を書く
- TDD 必須サイクル（`.claude/rules/tdd-mandatory-cycle.md`）に従いコミット分割。
  ただし本プランは「テスト追加のみ」なので、テストは既存実装に対して**パスする**
  ことが期待値（characterization）。実装は変更しない

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Install   | `bun install`            | exit 0              |
| Typecheck | `bun run typecheck`      | exit 0              |
| Unit      | `bun run test:unit`      | 全テストパス          |
| Lint      | `bun run lint`           | exit 0              |

## Steps

### Step 1: `updateGuest` のユニットテスト追加

`tests/unit/actions.test.ts` に `describe("updateGuest", ...)` を追加（既存モック
基盤を再利用。`supabaseFromMock` が `"guests"` テーブルにも `update` を返すよう
拡張が必要 — 既存の cabins 分岐を壊さないこと）。ケース:

1. 未ログイン（`authMock` が `null`）→ `"You must be logged in"` で reject
2. `nationality="Japan%🇯🇵"` → `update` が
   `{ nationality: "Japan", countryFlag: "🇯🇵", nationalID: ... }` で呼ばれる
3. 空文字フィールド → `null` に変換されて渡される
4. 成功時 `revalidatePath("/account/profile")` が呼ばれる
5. supabase エラー時 `"Guest could not be updated"` で reject

検証: `bun run test:unit` → 全パス。
コミット: `test(actions): add updateGuest unit coverage`

### Step 2: auth コールバックのユニットテスト追加

`tests/unit/auth.test.ts` を新規作成。`app/_lib/auth.ts` は `NextAuth()` の結果を
エクスポートしているため、コールバック単体を直接 import できない。方針:
`vi.mock("next-auth", ...)` で `NextAuth` をモックし、**渡された設定オブジェクト
（callbacks を含む）をキャプチャ**してから各コールバックを直接呼ぶ。
`data-service` の `getGuest` / `createGuest` もモックする。ケース:

1. `jwt`: `trigger: "signIn"` + email あり → `getGuest` が既存 guest を返すとき
   `token.guestId` にその id が入る
2. `jwt`: `getGuest` が `null` → `createGuest` が呼ばれ、その id が入る
3. `jwt`: `createGuest` が `code: "23505"` の `DatabaseError` を throw →
   再度 `getGuest` して得た guest の id が入る（競合リトライ）
4. `jwt`: `token.guestId` が既に number → DB 関数が呼ばれない
5. `jwt`: lookup が最終的に失敗 → throw（fail-fast）し、`logger.error` に
   生メールが**含まれない**こと（`hashedEmail` のみ）
6. `session`: `token.guestId: 42` → `session.user.guestId === 42`；
   `null` / `undefined` → `undefined`

検証: `bun run test:unit` → 全パス。
コミット: `test(auth): add jwt/session callback and guest auto-create coverage`

### Step 3: data-service フェッチャのテスト追加

`tests/unit/data-service.test.ts` に以下を追加（既存の supabase モックチェーンを
拡張）:

1. `getBookings`: `eq("guestId", ...)` と `order("startDate")` が呼ばれ、select
   文字列に `cabins(name, image, maxCapacity)` が含まれること。エラー時
   `"Bookings could not get loaded"`
2. `getBooking`: `eq("id", ...)` + `single()`；エラー時
   `"Booking could not get loaded"`、`data` が null なら `"Booking not found"`
3. `getSettings`: 成功時に data を返す。エラー時 `"Settings could not be loaded"`
4. `getGuest`: エラー時に **throw せず `null`** を返す（signIn フローの前提）
5. `createGuest`: エラー時に message `"Guest could not be created"` かつ
   `code` プロパティが元エラーから**保持**されること

検証: `bun run test:unit` → 全パス。`bun run typecheck` / `bun run lint` → exit 0。
コミット: `test(data-service): cover booking/guest/settings fetchers`

## Hard boundaries

- **In scope**: `tests/unit/actions.test.ts`、`tests/unit/auth.test.ts`（新規）、
  `tests/unit/data-service.test.ts`
- **Out of scope**: `app/` 配下の一切の実装コード（テストを通すために実装を
  変更したくなったら STOP — それはバグ発見であり、報告対象）。
  `tests/component/`、`tests/e2e/`、DateSelector のテスト（別所見 TEST-05、
  本プラン対象外）

## Done criteria（機械検証可能）

- `bun run test:unit` — 全パス、テスト件数が着手前より増えている
  （着手前の件数を最初に記録すること）
- `bun run typecheck` — exit 0
- `bun run lint` — exit 0
- `grep -c "describe" tests/unit/auth.test.ts` — 1以上

## Test plan

本プラン自体がテスト追加。パターン元は `tests/unit/actions.test.ts`（モック構成）
と `tests/unit/data-service.test.ts`（supabase チェーンモック）。

## Maintenance note

Plan 003 が `data-service.ts` と `actions.ts` の認可クエリを変更する予定。
本プランのテストがその回帰検知網になる。auth.ts のコールバック仕様は
next-auth v5 beta に依存するため、beta バンプ時はこのテストを最初に回すこと。

## STOP conditions

- `NextAuth()` の設定キャプチャが Vitest 環境で不可能（モジュール初期化順の問題等）
  な場合 → STOP。`getOrCreateGuestByEmail` を export してテストする代替案を
  提案として報告（実装変更になるため承認が必要）
- テストを書いた結果、既存実装のバグ（期待と異なる実挙動）を発見した場合 →
  実装を直さず STOP して報告
- 既存テストが1件でも落ち始めた場合 → STOP
