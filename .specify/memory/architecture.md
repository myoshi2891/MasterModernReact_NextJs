# アーキテクチャ設計

> 更新履歴: 2025-12-24 初版策定

## システム概要図

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ React       │  │ next/font   │  │ ReservationContext  │ │
│  │ Components  │  │ (local)     │  │ (日付範囲状態)       │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Next.js 14 (App Router)                    │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                   Server Components                      ││
│  │  - データ取得 (data-service.js)                          ││
│  │  - ISR / SSG / Dynamic Rendering                        ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │                   Server Actions                         ││
│  │  - createBooking / updateBooking / deleteBooking        ││
│  │  - updateGuest                                           ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │                   Middleware                             ││
│  │  - /account/* 認証保護                                   ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │                   API Routes                             ││
│  │  - /api/auth/[...nextauth] (NextAuth)                   ││
│  │  - /api/cabins/[cabinId]                                ││
│  │  - /api/health                                           ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌───────────────────┐ ┌─────────────┐ ┌─────────────────┐
│     Supabase      │ │   Google    │ │ External APIs   │
│   (PostgreSQL)    │ │   OAuth     │ │ (Countries)     │
│  ┌─────────────┐  │ └─────────────┘ └─────────────────┘
│  │  cabins     │  │
│  │  guests     │  │
│  │  bookings   │  │
│  │  settings   │  │
│  └─────────────┘  │
└───────────────────┘
```

## レイヤー構成

### 1. プレゼンテーション層 (`app/_components/`)

| カテゴリ | コンポーネント | 役割 |
|---------|---------------|------|
| Layout | Header, Navigation, Logo, SideNavigation | ナビゲーション・レイアウト |
| Auth | SignInButton, SignOutButton, LoginMessage | 認証UI |
| Cabin | CabinList, CabinCard, Cabin, Filter | キャビン表示 |
| Reservation | Reservation, ReservationForm, ReservationCard, ReservationList | 予約UI |
| Form | UpdateProfileForm, SelectCountry, SubmitButton, DeleteReservation | フォーム部品 |
| UI | Spinner, SpinnerMini, TextExpander, Counter, DateSelector | 汎用UI |

### 2. ビジネスロジック層 (`app/_lib/`)

```
app/_lib/
├── actions.js        # Server Actions (CRUD)
│   ├── createBooking()
│   ├── updateBooking()
│   ├── deleteBooking()
│   └── updateGuest()
│
├── booking.js        # 予約バリデーション
│   ├── calculateNumNights()
│   ├── calculateCabinPrice()
│   ├── isDateDisabled()
│   ├── isRangeBooked()
│   └── validateBookingInput()
│
├── guest.js          # ゲストユーティリティ
│   └── normalizeNationalId()
│
└── auth.js           # NextAuth設定
    ├── signIn callback
    ├── jwt callback
    └── session callback
```

### 3. データアクセス層 (`app/_lib/`)

```
app/_lib/
├── data-service.js   # データ取得関数
│   ├── getCabins()
│   ├── getCabin(id)
│   ├── getCabinPrice(id)
│   ├── getGuest(email)
│   ├── getBooking(id)
│   ├── getBookings(guestId)
│   ├── getBookedDatesByCabinId(cabinId)
│   ├── getSettings()
│   ├── getCountries()
│   └── createGuest(newGuest)
│
├── supabaseServer.js # サーバー専用クライアント (RLSバイパス)
└── supabaseBrowser.js # ブラウザ用クライアント
```

## データモデル

### 命名規則

| 種別 | 規則 | 例 |
|------|------|-----|
| テーブル名 | snake_case (複数形) | `cabins`, `bookings`, `guests` |
| カラム名 (一般) | camelCase | `regularPrice`, `numNights`, `guestId` |
| カラム名 (タイムスタンプ) | snake_case | `created_at` |
| 外部キー | camelCase + Id | `cabinId`, `guestId` |

**理由**: Supabase (PostgreSQL) の標準的なパターン。タイムスタンプのみ snake_case を維持し、
その他のカラムは JavaScript/TypeScript との親和性のため camelCase を採用。

### ER図

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   cabins    │     │  bookings   │     │   guests    │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id (PK)     │◄────│ cabinId (FK)│     │ id (PK)     │
│ name        │     │ id (PK)     │────►│ email       │
│ maxCapacity │     │ guestId (FK)│     │ fullName    │
│ regularPrice│     │ startDate   │     │ nationality │
│ discount    │     │ endDate     │     │ nationalID  │
│ image       │     │ numNights   │     │ countryFlag │
│ description │     │ numGuests   │     └─────────────┘
└─────────────┘     │ cabinPrice  │
                    │ extrasPrice │
                    │ totalPrice  │     ┌─────────────┐
                    │ status      │     │  settings   │
                    │ isPaid      │     ├─────────────┤
                    │ observations│     │ id (PK)     │
                    │ created_at* │     │ minNights   │
                    └─────────────┘     │ maxNights   │
                                        │ maxGuests   │
                                        │breakfastPrice│
                                        └─────────────┘

* created_at はタイムスタンプのため snake_case を維持
```

## ルーティング構成

### 公開ルート

| パス | ファイル | レンダリング |
|------|----------|-------------|
| `/` | `app/page.jsx` | Static |
| `/about` | `app/about/page.jsx` | Static |
| `/cabins` | `app/cabins/page.jsx` | ISR (3600s) |
| `/cabins/[cabinId]` | `app/cabins/[cabinId]/page.jsx` | SSG + Dynamic |
| `/cabins/thankyou` | `app/cabins/thankyou/page.jsx` | Static |
| `/login` | `app/login/page.jsx` | Static |

### 認証必須ルート (Middleware保護)

| パス | ファイル | レンダリング |
|------|----------|-------------|
| `/account` | `app/account/page.jsx` | Dynamic |
| `/account/profile` | `app/account/profile/page.jsx` | Dynamic |
| `/account/reservations` | `app/account/reservations/page.jsx` | Force Dynamic |
| `/account/reservations/edit/[bookingId]` | `app/account/reservations/edit/[bookingId]/page.jsx` | Dynamic |

## 認証フロー

```
1. ユーザーが /login にアクセス
2. SignInButton クリック → signIn("google")
3. Google OAuth 認証
4. NextAuth callbacks:
   ├── signIn(): 認証成功を確認
   ├── jwt(): guestId をトークンに追加
   │   └── getOrCreateGuestByEmail() でDB登録/取得
   └── session(): guestId をセッションに公開
5. Middleware が /account/* へのアクセスを許可
6. Server Components で auth() からセッション取得
```

## キャッシング戦略

### ISR (Incremental Static Regeneration)

```javascript
// app/cabins/page.jsx
export const revalidate = 3600; // 1時間
```

### Force Dynamic

```javascript
// app/account/reservations/page.jsx
export const dynamic = "force-dynamic";
```

### SSG with generateStaticParams

```javascript
// app/cabins/[cabinId]/page.jsx
export async function generateStaticParams() {
  const cabins = await getCabins();
  return cabins.map((cabin) => ({ cabinId: String(cabin.id) }));
}
```

### revalidatePath (Server Actions後)

```javascript
// actions.js
revalidatePath("/account/reservations");
redirect("/account/reservations");
```

## エラーハンドリング

### 階層構造

```
app/
├── error.jsx          # グローバルエラーバウンダリ
├── not-found.jsx      # 404ページ
├── loading.jsx        # グローバルローディング
└── cabins/
    └── [cabinId]/
        └── not-found.jsx  # キャビン個別404
```

### Server Actions

```javascript
try {
  // 操作実行
} catch (error) {
  console.error(error);
  throw new Error("ユーザー向けエラーメッセージ");
}
```

## セキュリティ設計

### 認可チェック

```javascript
// actions.js での guestId 検証
const session = await auth();
if (!session?.user?.guestId) {
  throw new Error("認証が必要です");
}

// 予約所有者チェック
const booking = await getBooking(bookingId);
if (booking.guestId !== session.user.guestId) {
  throw new Error("この予約にはアクセスできません");
}
```

### 入力検証

```javascript
// booking.js
export function validateBookingInput({
  startDate,
  endDate,
  numGuests,
  cabinId,
  maxCapacity,
  regularPrice,
  discount,
}) {
  // 包括的なバリデーション
}
```
