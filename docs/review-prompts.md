# レビュー対応プロンプト集

**作成日**: 2024-12-24
**用途**: 各フェーズをClaude Codeに依頼するためのプロンプト

> 各プロンプトはコピーして新しいセッションで使用してください。
> 前提として `docs/review-action-plan.md` を参照させることで文脈を維持します。

---

## Phase 1.1: DB調査・判断

```
docs/review-action-plan.md の Phase 1.1 を実施してください。

具体的には:
1. Supabaseの bookings テーブルの startDate/endDate の型を確認
2. status カラムの実際の値を確認
3. 既存データに重複予約がないかチェック

確認SQLは review-action-plan.md に記載があります。
結果に基づいて、DB制約を実装する(Option A)か、仕様書を将来計画としてマークする(Option B)かの推奨を提示してください。
```

---

## Phase 1.2: booking.js 末尾改行追加

```
docs/review-action-plan.md の Phase 1.2 を実施してください。

app/_lib/booking.js の末尾に改行がないため、POSIX準拠になるよう改行を追加してください。
修正後、tail コマンドで確認してください。
```

---

## Phase 2.1: エラーマッピング実装

```
docs/review-action-plan.md の Phase 2.1 を実施してください。

以下を実装してください:
1. app/_lib/errors.js を新規作成（BookingError クラスと mapSupabaseError 関数）
2. app/_lib/actions.js の createBooking, updateBooking, deleteBooking でエラーマッピングを適用

仕様:
- 23P01 (exclusion violation) → 409 Conflict
- 23514 (check violation) → 400 Bad Request
- 23505 (unique violation) → 409 Conflict
- P0001 + CAPACITY_EXCEEDED → 400
- P0001 + CABIN_NOT_FOUND → 404
- その他 → 500

既存のテスト (tests/unit/actions.test.js) が通ることを確認してください。
```

---

## Phase 2.2: SignOutButton 確認・修正

```
docs/review-action-plan.md の Phase 2.2 を実施してください。

app/_components/SignOutButton.jsx を確認し、以下を検証してください:
1. next-auth/react の signOut を使用しているか
2. Server Action から呼び出していないか（auth.js から signOut エクスポートが削除されているため）
3. SignInButton.jsx と同様のパターン（Client Component + useStateでローディング管理）になっているか

問題があれば修正してください。
```

---

## Phase 3.1: CI E2Eテスト追加

```
docs/review-action-plan.md の Phase 3.1 を実施してください。

.github/workflows/ci.yml に E2E テストジョブを追加してください。

要件:
1. test ジョブ完了後に実行 (needs: test)
2. Playwright chromium のみインストール（CI高速化のため）
3. SKIP_SSG=true でビルド
4. テスト失敗時は playwright-report をアーティファクトとしてアップロード

参考: review-action-plan.md に YAML サンプルがあります。
```

---

## Phase 4: DB制約実装（Option A選択時）

### Phase 4.1: マイグレーションファイル作成

```
docs/review-action-plan.md の Phase 4.1 を実施してください。

以下の条件でマイグレーションファイルを作成してください:
- ファイル名: supabase/migrations/YYYYMMDDHHMMSS_booking_constraints.sql
- startDate/endDate の型: [Phase 1.1で確認した型を記入]
- status のキャンセル値: [Phase 1.1で確認した値を記入]

含める制約:
1. btree_gist 拡張の有効化
2. 排他制約 (bookings_no_overlap) - 重複予約防止
3. チェック制約 (bookings_date_order) - 日付順序
4. チェック制約 (bookings_num_guests) - 人数最低値

参考SQLは review-action-plan.md にあります。
```

### Phase 4.2: キャパシティチェックトリガー追加

```
docs/review-action-plan.md の Phase 4.2 を実施してください。

Phase 4.1 で作成したマイグレーションファイルに、キャパシティチェック用のトリガーを追加してください。

要件:
- cabins.maxCapacity を超える numGuests を拒否
- cabinId が存在しない場合も拒否
- エラーコードは P0001 で、メッセージで CAPACITY_EXCEEDED / CABIN_NOT_FOUND を区別
```

### Phase 4.3: ローカルテスト

```
docs/review-action-plan.md の Phase 4.3 を実施してください。

1. supabase start でローカル環境を起動
2. supabase db push でマイグレーション適用
3. 以下のテストケースを実行して制約が機能することを確認:
   - 同一キャビン・重複日程で2件INSERT → 2件目が 23P01 で失敗
   - startDate >= endDate でINSERT → 23514 で失敗
   - numGuests = 0 でINSERT → 23514 で失敗
   - 存在しない cabinId でINSERT → P0001 CABIN_NOT_FOUND
   - maxCapacity を超える numGuests → P0001 CAPACITY_EXCEEDED

テスト用SQLも作成してください。
```

---

## Phase 5.1: guest.js JSDoc拡充

```
docs/review-action-plan.md の Phase 5.1 を実施してください。

app/_lib/guest.js の normalizeNationalId 関数のJSDocを拡充してください。

追加すべき内容:
- 入力値から英数字以外を除去する旨
- 変換例（例: "AB-1234-CD" → "AB1234CD"）
- 空文字入力時の挙動
- バリデーションエラー時の挙動
```

---

## Phase 5.2: data-service.js コメント追加

```
docs/review-action-plan.md の Phase 5.2 を実施してください。

app/_lib/data-service.js の以下の行にコメントを追加してください:

const cacheFn = typeof cache === "function" ? cache : (fn) => fn;

コメント内容:
- なぜフォールバックが必要か（React 18.2以前/テスト環境対応）
- 本番環境（Next.js 14+）では常にReactのcacheが使用される旨
```

---

## Phase 6: 仕様書ステータス更新（Option B選択時）

```
docs/review-action-plan.md の Phase 6 を実施してください。

specs/002-booking-concurrency-control/spec.md の冒頭に、以下のステータス表記を追加してください:

- 現在のステータス: 設計完了・実装未着手
- 現時点ではアプリケーション側のバリデーションのみで運用中
- DB制約の実装は将来フェーズで予定

マークダウンの引用ブロック（> ）を使用し、視覚的に目立つようにしてください。
```

---

## 全フェーズ完了後: 最終確認

```
docs/review-action-plan.md の全フェーズが完了しました。

以下の最終確認を実施してください:
1. npm run lint - Lintエラーがないこと
2. npm run test:unit - ユニットテスト全パス
3. npm run test:component - コンポーネントテスト全パス
4. npm run build - ビルド成功
5. git diff --stat - 変更ファイル一覧の確認

問題がなければ、docs/review-action-plan.md のチェックリストを更新し、対応完了としてマークしてください。
```

---

## 補足: コミットメッセージテンプレート

各フェーズ完了時のコミットメッセージ例:

```
# Phase 1.2
fix: add trailing newline to booking.js

# Phase 2.1
feat: implement SQLSTATE to HTTP error mapping

# Phase 2.2
fix: migrate SignOutButton to client-side signOut

# Phase 3.1
ci: add E2E test job with Playwright

# Phase 4.x
feat(db): add booking overlap and validation constraints

# Phase 5.x
docs: clarify nationalId normalization and cache fallback
```