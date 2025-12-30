# レビュー指摘事項 対応計画

**作成日**: 2024-12-24
**対象コミット**: 141a1a6 以降の改修

---

## Phase 1: 即時対応（P0 - 1-2日）

### 1.1 仕様書と実装の整合性を取る判断

**背景**: `specs/002-booking-concurrency-control/spec.md` でDB制約が定義されているが未実装

**選択肢**:
- **Option A**: DB制約を実装する（推奨）
- **Option B**: 仕様書を「将来計画」として明示的にマーク

**決定が必要な項目**:
- [ ] `startDate`/`endDate` の型確認（date or timestamptz）
- [ ] `status` の実値確認（canceled の判定基準）
- [ ] 既存データに重複がないか検査

**確認SQL**:
```sql
-- 型確認
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'bookings'
  AND column_name IN ('startDate', 'endDate');

-- status 実値確認
SELECT DISTINCT status FROM bookings ORDER BY status;

-- 重複チェック
SELECT b1.id, b2.id, b1."cabinId"
FROM bookings b1
JOIN bookings b2
  ON b1."cabinId" = b2."cabinId"
 AND b1.id < b2.id
 AND daterange(b1."startDate"::date, b1."endDate"::date, '[)') &&
     daterange(b2."startDate"::date, b2."endDate"::date, '[)')
WHERE b1.status <> 'canceled'
  AND b2.status <> 'canceled';
```

---

### 1.2 booking.js 末尾改行追加

**対象ファイル**: `app/_lib/booking.js`

**作業内容**:
```bash
# 末尾に改行を追加
echo "" >> app/_lib/booking.js
```

**確認コマンド**:
```bash
tail -c 1 app/_lib/booking.js | od -c
# 期待値: 0000000  \n
```

---

## Phase 2: エラーハンドリング改善（P0-P1 - 3-5日）

### 2.1 SQLSTATEからHTTPへのマッピング実装

**対象ファイル**: `app/_lib/actions.js`

**新規作成ファイル**: `app/_lib/errors.js`

**実装内容**:

```javascript
// app/_lib/errors.js

export class BookingError extends Error {
  constructor(message, statusCode = 500, code = null) {
    super(message);
    this.name = 'BookingError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * SupabaseエラーをBookingErrorに変換
 */
export function mapSupabaseError(error) {
  const code = error?.code;
  const message = error?.message ?? '';

  switch (code) {
    case '23P01': // exclusion violation
      return new BookingError(
        '選択日程は既に予約されています',
        409,
        'BOOKING_CONFLICT'
      );
    case '23514': // check violation
      return new BookingError(
        '入力内容に誤りがあります',
        400,
        'VALIDATION_ERROR'
      );
    case '23505': // unique violation
      return new BookingError(
        '既に処理済みのリクエストです',
        409,
        'DUPLICATE_REQUEST'
      );
    case 'P0001': // raise exception
      if (message.includes('CAPACITY_EXCEEDED')) {
        return new BookingError('定員を超えています', 400, 'CAPACITY_EXCEEDED');
      }
      if (message.includes('CABIN_NOT_FOUND')) {
        return new BookingError('キャビンが見つかりません', 404, 'CABIN_NOT_FOUND');
      }
      break;
  }

  // 未知のエラー
  console.error('[DB Error]', code, message);
  return new BookingError('予約処理に失敗しました', 500, 'INTERNAL_ERROR');
}
```

**actions.js への適用例**:

```javascript
import { mapSupabaseError } from './errors';

// createBooking 内
const { error } = await supabaseServer.from("bookings").insert([newBooking]);
if (error) {
  throw mapSupabaseError(error);
}
```

---

### 2.2 SignOutButton の実装確認

**確認対象**: `app/_components/SignOutButton.jsx`

**確認ポイント**:
- `next-auth/react` の `signOut` を使用しているか
- Server Action を使用している場合は Client Component への移行が必要

---

## Phase 3: CI/CD強化（P1 - 2-3日）

### 3.1 E2Eテストをワークフローに追加

**対象ファイル**: `.github/workflows/ci.yml`

**追加内容**:

```yaml
  e2e:
    runs-on: ubuntu-latest
    needs: test
    env:
      NEXT_PUBLIC_SUPABASE_URL: http://localhost:54321
      NEXT_PUBLIC_SUPABASE_KEY: test
      SUPABASE_URL: http://localhost:54321
      SUPABASE_SERVICE_ROLE_KEY: test
      AUTH_GOOGLE_ID: test
      AUTH_GOOGLE_SECRET: test
      NEXTAUTH_URL: http://localhost:3000
      NEXTAUTH_SECRET: test-secret
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: npm
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
      - name: Build
        env:
          SKIP_SSG: "true"
        run: npm run build
      - name: Run E2E tests
        run: npm run test:e2e
      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Phase 4: DB制約実装（Option A選択時 - 1週間）

### 4.1 マイグレーションファイル作成

**新規作成**: `supabase/migrations/YYYYMMDDHHMMSS_booking_constraints.sql`

```sql
-- 1. btree_gist 拡張を有効化
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 2. 排他制約（重複予約防止）
-- ※ 型に応じて tstzrange または daterange を選択
ALTER TABLE bookings
  ADD CONSTRAINT bookings_no_overlap
  EXCLUDE USING gist (
    "cabinId" WITH =,
    daterange("startDate"::date, "endDate"::date, '[)') WITH &&
  )
  WHERE (status <> 'canceled');

-- 3. チェック制約（日付順序）
ALTER TABLE bookings
  ADD CONSTRAINT bookings_date_order
  CHECK ("startDate" < "endDate");

-- 4. チェック制約（人数）
ALTER TABLE bookings
  ADD CONSTRAINT bookings_num_guests
  CHECK ("numGuests" >= 1);
```

### 4.2 キャパシティチェックトリガー

```sql
CREATE OR REPLACE FUNCTION check_booking_capacity()
RETURNS TRIGGER AS $$
DECLARE max_cap INT;
BEGIN
  SELECT "maxCapacity" INTO max_cap
  FROM cabins
  WHERE id = NEW."cabinId";

  IF max_cap IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'CABIN_NOT_FOUND';
  END IF;

  IF NEW."numGuests" > max_cap THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'CAPACITY_EXCEEDED';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bookings_capacity_check
BEFORE INSERT OR UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION check_booking_capacity();
```

### 4.3 ローカルでのテスト手順

```bash
# 1. Supabaseローカル起動
supabase start

# 2. マイグレーション適用
supabase db push

# 3. 重複テスト
# 同一キャビン・同一日程で2回INSERTを試みる
# → 2回目で23P01エラーが発生することを確認
```

---

## Phase 5: ドキュメント整備（P2 - 1-2日）

### 5.1 nationalId 正規化の仕様明文化

**対象ファイル**: `app/_lib/guest.js` のJSDocを拡充

```javascript
/**
 * 国民ID（パスポート番号等）を正規化する
 *
 * 入力値から英数字以外を除去し、6-12文字の形式に変換する。
 * 例: "AB-1234-CD" → "AB1234CD"
 *
 * @param {*} rawValue - 生の入力値
 * @returns {string} 正規化されたID（空文字の場合はそのまま返す）
 * @throws {Error} 正規化後の値が6-12文字の英数字でない場合
 */
```

### 5.2 data-service.js の cache フォールバックにコメント追加

```javascript
/**
 * React 18.2以前またはテスト環境でcacheが未定義の場合のフォールバック
 * 本番環境(Next.js 14+)では常にReactのcacheが使用される
 */
const cacheFn = typeof cache === "function" ? cache : (fn) => fn;
```

---

## Phase 6: 仕様書更新（Option B選択時）

仕様書を「将来計画」として明示する場合:

**対象ファイル**: `specs/002-booking-concurrency-control/spec.md`

冒頭に以下を追加:

```markdown
> ⚠️ **ステータス: 設計完了・実装未着手**
>
> このドキュメントはDB制約の設計仕様です。
> 現時点ではアプリケーション側のバリデーションのみで運用中です。
> DB制約の実装は Phase 2 で予定しています。
```

---

## タイムライン（目安）

| Phase | 期間 | 担当 | 状態 |
|-------|------|------|------|
| 1.1 DB調査・判断 | Day 1 | Tech Lead | ⬜ |
| 1.2 booking.js 改行 | Day 1 | Any | ⬜ |
| 2.1 エラーマッピング | Day 2-4 | Backend | ⬜ |
| 2.2 SignOutButton確認 | Day 2 | Frontend | ⬜ |
| 3.1 CI E2E追加 | Day 5-6 | DevOps | ⬜ |
| 4.x DB制約実装 | Day 7-12 | Backend/DBA | ⬜ |
| 5.x ドキュメント | Day 13-14 | Any | ⬜ |

---

## チェックリスト

### Phase 1 完了条件
- [ ] DB型・status実値を確認した
- [ ] 既存データに重複がないことを確認した
- [ ] Option A/B の判断を下した
- [ ] booking.js の末尾改行を追加した

### Phase 2 完了条件
- [ ] `app/_lib/errors.js` を作成した
- [ ] actions.js でエラーマッピングを使用している
- [ ] SignOutButton が正しく動作する

### Phase 3 完了条件
- [ ] CI で E2E テストが実行される
- [ ] テスト失敗時にレポートがアップロードされる

### Phase 4 完了条件（Option A選択時）
- [ ] マイグレーションファイルが作成された
- [ ] ローカルで制約違反テストが通る
- [ ] ステージング環境でデプロイ確認
- [ ] 本番適用

### Phase 5 完了条件
- [x] guest.js のJSDocが拡充された
- [x] data-service.js のコメントが追加された
