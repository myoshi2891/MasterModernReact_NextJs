# 技術スタック詳細

> 更新履歴: 2025-12-24 初版策定

## フレームワーク・ランタイム

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Node.js | >=20 | ランタイム |
| Next.js | 14.2.35 | フレームワーク (App Router) |
| React | ^18 | UIライブラリ |

### Next.js 機能利用状況

| 機能 | 使用 | 備考 |
|------|-----|------|
| App Router | ✅ | `app/` ディレクトリ |
| Server Components | ✅ | デフォルト |
| Server Actions | ✅ | `actions.js` |
| ISR | ✅ | `revalidate = 3600` |
| Middleware | ✅ | 認証保護 |
| Image Optimization | ✅ | `next/image` |
| Font Optimization | ✅ | `next/font/local` |
| Route Handlers | ✅ | `/api/` |

## データベース・バックエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Supabase | ^2.56.0 | BaaS (PostgreSQL) |

### Supabase 機能利用状況

| 機能 | 使用 | 備考 |
|------|-----|------|
| Database (PostgreSQL) | ✅ | メインデータストア |
| Row Level Security | ✅ | 認可制御 |
| Storage | ✅ | キャビン画像 |
| Auth | ❌ | NextAuth使用 |
| Realtime | ❌ | 未使用 |
| Edge Functions | ❌ | 未使用 |

### データベーステーブル

```sql
-- cabins: キャビン情報
CREATE TABLE cabins (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  maxCapacity INTEGER NOT NULL,
  regularPrice DECIMAL NOT NULL,
  discount DECIMAL DEFAULT 0,
  image TEXT,
  description TEXT
);

-- guests: ゲスト情報
CREATE TABLE guests (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  fullName TEXT,
  nationality TEXT,
  nationalID TEXT,
  countryFlag TEXT
);

-- bookings: 予約情報
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  guestId INTEGER REFERENCES guests(id),
  cabinId INTEGER REFERENCES cabins(id),
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  numNights INTEGER NOT NULL,
  numGuests INTEGER NOT NULL,
  cabinPrice DECIMAL NOT NULL,
  extrasPrice DECIMAL DEFAULT 0,
  totalPrice DECIMAL NOT NULL,
  status TEXT DEFAULT 'unconfirmed',
  isPaid BOOLEAN DEFAULT FALSE,
  observations TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- settings: アプリ設定
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  minNights INTEGER DEFAULT 1,
  maxNights INTEGER DEFAULT 30,
  maxGuests INTEGER DEFAULT 10,
  breakfastPrice DECIMAL DEFAULT 0
);
```

## 認証

| 技術 | バージョン | 用途 |
|------|-----------|------|
| NextAuth.js | 4.24.13 | 認証フレームワーク |

### 認証設定

```javascript
// app/_lib/auth.js
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    signIn: async () => true,
    jwt: async ({ token, user }) => { /* guestId追加 */ },
    session: async ({ session, token }) => { /* guestId公開 */ },
  },
};
```

## スタイリング

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Tailwind CSS | ^3.4.1 | ユーティリティCSS |
| PostCSS | - | CSSプロセッサ |

### カスタムカラーパレット

```javascript
// tailwind.config.js
colors: {
  primary: {
    50: "#E1E8EF",  // 最も明るい
    // ... 中間色
    950: "#141C24", // 最も暗い (メイン背景)
  },
  accent: {
    50: "#FAF5F0",  // 最も明るい
    // ... 中間色
    950: "#3D2C1E", // 最も暗い
  },
}
```

### フォント

```javascript
// app/layout.jsx
import localFont from "next/font/local";

const josefinSans = localFont({
  src: "./fonts/JosefinSans-VariableFont_wght.ttf",
  variable: "--font-josefin",
  display: "swap",
});
```

## UIコンポーネント

| 技術 | バージョン | 用途 |
|------|-----------|------|
| @heroicons/react | ^2.1.5 | アイコン |
| react-day-picker | ^8.10.1 | 日付選択 |

### アイコン使用例

```jsx
import { CalendarDaysIcon } from "@heroicons/react/24/solid";

<CalendarDaysIcon className="h-5 w-5 text-primary-600" />
```

### 日付選択使用例

```jsx
import { DayPicker } from "react-day-picker";

<DayPicker
  mode="range"
  selected={range}
  onSelect={setRange}
  disabled={isDateDisabled}
/>
```

## ユーティリティ

| 技術 | バージョン | 用途 |
|------|-----------|------|
| date-fns | ^3.6.0 | 日付操作 |

### 使用関数

```javascript
import { differenceInCalendarDays, isWithinInterval, parseISO } from "date-fns";

// 宿泊日数計算
differenceInCalendarDays(endDate, startDate);

// 日付範囲チェック
isWithinInterval(date, { start, end });

// ISO文字列パース
parseISO("2025-01-01");
```

## テスト

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Vitest | ^3.2.4 | テストランナー |
| @testing-library/react | ^16.3.0 | コンポーネントテスト |
| @playwright/test | ^1.55.1 | E2Eテスト |
| MSW | ^2.11.3 | APIモック |

### テスト設定

```javascript
// vitest.config.mts
export default defineConfig({
  test: {
    projects: [
      {
        name: "unit",
        include: ["tests/unit/**/*.test.*"],
        environment: "node",
      },
      {
        name: "component",
        include: ["tests/component/**/*.test.*"],
        environment: "jsdom",
      },
    ],
  },
});
```

## 開発ツール

| 技術 | バージョン | 用途 |
|------|-----------|------|
| ESLint | ^8.57.0 | リンター |
| eslint-config-next | 14.2.4 | Next.js用ルール |

## インフラ・CI

| 技術 | 用途 |
|------|------|
| Docker | ローカル開発環境 |
| docker-compose | マルチコンテナ管理 |
| GitHub Actions | CI/CD |

### CI ワークフロー

```yaml
# .github/workflows/ci.yml
jobs:
  test:
    strategy:
      matrix:
        node: [20, 22]
    steps:
      - npm ci
      - npm run lint
      - npm run test:unit
      - npm run test:component
      - SKIP_SSG=true npm run build
      - curl /api/health (スモークテスト)
```

## 環境変数一覧

### 必須 (本番)

| 変数名 | 説明 |
|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL (公開) |
| `NEXT_PUBLIC_SUPABASE_KEY` | Supabase anon key (公開) |
| `SUPABASE_URL` | Supabase URL (サーバー) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (秘密) |
| `AUTH_GOOGLE_ID` | Google OAuth Client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth Secret |
| `NEXTAUTH_URL` | アプリURL |
| `NEXTAUTH_SECRET` | セッション暗号化キー |

### オプション

| 変数名 | 説明 |
|--------|------|
| `SKIP_SSG` | SSGスキップ (CIビルド用) |
| `PLAYWRIGHT_BASE_URL` | E2Eテスト用URL |
| `TZ` | タイムゾーン |

## 移行予定

### TypeScript 移行

- 計画書: `typescript-migration-plan.md`
- ステータス: 未着手
- 優先度: 中

### npm → Bun 移行

- 計画書: `npm-to-bun-migration-plan.md`
- ステータス: 未着手
- 優先度: 低