# The Wild Oasis - Claude Code Memory Bank

このファイルはClaude Codeがプロジェクトを理解するためのエントリポイントです。

## プロジェクト概要

**The Wild Oasis** は、キャビン宿泊予約システムです。
- フレームワーク: Next.js 16 (App Router / Turbopack 既定)
- 言語: TypeScript 6 (strict モード)
- データベース: Supabase (PostgreSQL)
- 認証: Auth.js (NextAuth) v5 (Google OAuth)
- スタイリング: Tailwind CSS v4 (`@import "tailwindcss"` + `@config` 互換読み込み)
- Lint: ESLint 9 Flat Config (`eslint.config.mjs`、`next lint` は Next 16 で廃止)
- 多言語: 日英2言語対応 (クライアントサイド Context)

## クイックスタート

```bash
# 依存関係インストール
bun install

# 開発サーバー起動
bun run dev

# テスト実行
bun run test:unit       # ユニットテスト
bun run test:component  # コンポーネントテスト
bun run test:e2e        # E2Eテスト (Playwright)
bun run test:all        # 全テスト

# ビルド
bun run build
```

## ディレクトリ構造

```
app/
├── _components/          # 共通コンポーネント (34個)
├── _lib/                 # ユーティリティ・データサービス
│   ├── actions.ts        # Server Actions (CRUD操作)
│   ├── auth.ts           # NextAuth設定
│   ├── booking.ts        # 予約バリデーション
│   ├── data-service.ts   # Supabaseデータ取得
│   ├── errors.ts         # エラーマッピング (SQLSTATE → HTTP)
│   ├── guest.ts          # ゲストユーティリティ
│   ├── logger.ts         # 構造化ログ (StructuredLogger)
│   ├── translations.ts   # 翻訳辞書 (en/ja)
│   ├── supabaseServer.ts # サーバー専用クライアント
│   └── supabaseBrowser.ts # ブラウザ用クライアント
├── _styles/              # グローバルCSS
├── about/                # アバウトページ
├── account/              # 認証必須エリア
│   ├── profile/          # プロフィール編集
│   └── reservations/     # 予約一覧・編集
├── cabins/               # キャビン一覧・詳細
│   └── [cabinId]/        # 動的ルート
├── login/                # ログインページ
└── api/                  # APIルート
    ├── auth/[...nextauth]/ # NextAuth
    ├── cabins/[cabinId]/   # キャビンAPI
    └── health/             # ヘルスチェック
```

## 主要機能

### 1. キャビン一覧・詳細 (`/cabins`)
- 一覧: `revalidate: 3600` (ISR)、容量でフィルタリング (small/medium/large)
- 詳細: `generateStaticParams()` でパラメータ列挙
- 注: Next.js 16 では既定が request-time レンダリングのため、詳細ページ
  (`/cabins/[cabinId]`) は dynamic 描画。SSG/ISR 復元には Cache Components
  (PPR / `"use cache"`) の採用が別途必要

### 2. 予約システム
- 日付選択 (react-day-picker)
- 予約作成/編集/削除 (Server Actions)
- 認証済みユーザーのみ操作可能
- DB制約による重複予約防止 (EXCLUDE制約)
- ユーザーフレンドリーなエラーメッセージ (SQLSTATE → HTTPマッピング)

### 3. 認証 (`/login`, `/account`)
- Google OAuth
- JWT セッション戦略
- Middleware による保護 (`/account/*`)

### 4. 多言語対応 (i18n)
- 日本語・英語の2言語対応
- `LanguageContext` によるクライアントサイド言語管理
- `localStorage` による言語設定の永続化
- 翻訳辞書: `app/_lib/translations.ts`
- 言語切替: `app/_components/LanguageToggle.tsx`

## 重要なコード規約

### データ取得
- サーバーコンポーネント: `data-service.ts` の関数を使用
- ミューテーション: `actions.ts` の Server Actions を使用
- ブラウザから直接Supabaseを呼ばない

### Supabaseクライアント

```typescript
// サーバー側 (RLSバイパス)
import supabaseServer from "@/app/_lib/supabaseServer";

// ブラウザ側 (公開キー)
import supabaseBrowser from "@/app/_lib/supabaseBrowser";
```

### 状態管理
- `ReservationContext` で日付範囲を管理
- `LanguageContext` で言語設定を管理（en/ja、localStorage 永続化）
- Redux/Zustand は未使用

## テスト構成

| 種類 | 場所 | 環境 |
|------|------|------|
| Unit | `tests/unit/` | Node |
| Component | `tests/component/` | jsdom |
| E2E | `tests/e2e/` | Playwright |

- Component テストは `renderWithProviders()` で `LanguageProvider` をラップ（`tests/helpers/render-with-providers.tsx`）

## CI構成

```
lint-and-test (Node 20.19.6, 22.x)
    ├── Lint
    ├── Unit tests
    ├── Component tests
    ├── Build
    └── Smoke test (/api/health)
           ↓
        e2e (Node 20.19.6)
    ├── Build
    └── Playwright E2E tests (レポート7日間保持)
```

- E2Eテストは `lint-and-test` 完了後に実行
- テストレポートはGitHub Actionsアーティファクトで確認可能

## 環境変数 (.env)

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# NextAuth
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
```

## Claude Code メモリ階層

| レイヤー | ファイル | 変更頻度 | 内容 |
|---------|---------|---------|------|
| グローバル静的 | `~/.claude/CLAUDE.md` | ほぼ不変 | エンジニアリング原則、コード規約 |
| プロジェクト | `CLAUDE.md`（リポジトリルート） | 低頻度 | アーキテクチャ、ビルドコマンド、規約 |
| セッション | `.claude/settings.local.json` | 必要時 | プロジェクト固有の権限設定 |

## 関連ドキュメント

### メモリバンク (Kilo Code / Spec Kit)
- [.specify/memory/constitution.md](.specify/memory/constitution.md) - 品質・非機能要件
- [.specify/memory/architecture.md](.specify/memory/architecture.md) - アーキテクチャ詳細
- [.specify/memory/tech-stack.md](.specify/memory/tech-stack.md) - 技術スタック

### 仕様書
- [specs/index.md](specs/index.md) - 仕様書インデックス
- [specs/001-sample-feature/](specs/001-sample-feature/) - サンプル仕様

### 運用
- [docs/progress.md](docs/progress.md) - 進捗ログ
- [README_kilocode_speckit.md](README_kilocode_speckit.md) - Kilo Code導入メモ

## 開発フロー

1. 新機能は `specs/NNN-<feature-name>/` を作成
2. `spec.md` → `plan.md` → `tasks.md` の順で策定
3. 実装完了後、`docs/progress.md` に記録
4. PRは `.kilocode/workflows/submit-pr.md` に従う

## よく使うコマンド

```bash
# Lint
bun run lint

# 型チェック
bun run typecheck

# Supabaseローカル
supabase start
supabase stop

# Docker開発環境
docker compose up --build
docker compose down
```

## 注意事項

- `SKIP_SSG=true` はビルド時のみ使用 (テスト時は不要)
- 予約操作は認証必須、`guestId` の検証を忘れずに
- 外部画像は `next.config.mjs` の `remotePatterns` で許可
- i18n はクライアント Context 依存: 翻訳対象コンポーネントは `"use client"` 必須
