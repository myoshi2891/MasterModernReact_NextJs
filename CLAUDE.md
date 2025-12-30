# The Wild Oasis - Claude Code Memory Bank

このファイルはClaude Codeがプロジェクトを理解するためのエントリポイントです。

## プロジェクト概要

**The Wild Oasis** は、キャビン宿泊予約システムです。
- フレームワーク: Next.js 14 (App Router)
- データベース: Supabase (PostgreSQL)
- 認証: NextAuth.js 4.x (Google OAuth)
- スタイリング: Tailwind CSS

## クイックスタート

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# テスト実行
npm run test:unit       # ユニットテスト
npm run test:component  # コンポーネントテスト
npm run test:e2e        # E2Eテスト (Playwright)
npm run test:all        # 全テスト

# ビルド
npm run build
```

## ディレクトリ構造

```
app/
├── _components/          # 共通コンポーネント (27個)
├── _lib/                 # ユーティリティ・データサービス
│   ├── actions.js        # Server Actions (CRUD操作)
│   ├── auth.js           # NextAuth設定
│   ├── booking.js        # 予約バリデーション
│   ├── data-service.js   # Supabaseデータ取得
│   ├── errors.js         # エラーマッピング (SQLSTATE → HTTP)
│   ├── guest.js          # ゲストユーティリティ
│   ├── supabaseServer.js # サーバー専用クライアント
│   └── supabaseBrowser.js # ブラウザ用クライアント
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
- ISR (revalidate: 3600秒)
- 容量でフィルタリング (small/medium/large)
- `generateStaticParams()` による静的生成

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

## 重要なコード規約

### データ取得
- サーバーコンポーネント: `data-service.js` の関数を使用
- ミューテーション: `actions.js` の Server Actions を使用
- ブラウザから直接Supabaseを呼ばない

### Supabaseクライアント
```javascript
// サーバー側 (RLSバイパス)
import supabaseServer from "@/app/_lib/supabaseServer";

// ブラウザ側 (公開キー)
import supabaseBrowser from "@/app/_lib/supabaseBrowser";
```

### 状態管理
- `ReservationContext` で日付範囲を管理
- Redux/Zustand は未使用

## テスト構成

| 種類 | 場所 | 環境 |
|------|------|------|
| Unit | `tests/unit/` | Node |
| Component | `tests/component/` | jsdom |
| E2E | `tests/e2e/` | Playwright |

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
npm run lint

# 型チェック (TypeScript移行後)
npm run typecheck

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
