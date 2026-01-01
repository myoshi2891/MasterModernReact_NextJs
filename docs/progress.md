# 進捗一覧
Status: 未確認 / 確認中 / 完了 / 差し戻し

## コミット進捗

| Status | Commit | Date | Summary | Notes |
| --- | --- | --- | --- | --- |
| 完了 | 8f3bdaf | 2025-12-31 | fix: address CodeRabbit review feedback for test files | テストファイルレビュー対応 |
| 完了 | 58d0c7f | 2025-12-31 | refactor: complete TypeScript Phase 6 - migrate all tests to TypeScript | **TypeScript Phase 6 完了** |
| 完了 | 988f063 | 2025-12-31 | fix: address CodeRabbit review feedback (round 5) | Counter動的aria-label、TextExpander改善 |
| 完了 | 38b8896 | 2025-12-31 | fix: address additional CodeRabbit review feedback | アクセシビリティ・UX改善 |
| 完了 | fb75e3e | 2025-12-31 | fix: address CodeRabbit review feedback for Phase 4 TypeScript migration | Phase 4レビュー対応 |
| 完了 | e84fe72 | 2025-12-31 | 📝 Add docstrings to `macbook-dev` | JSDoc追加 |
| 完了 | 4b5005b | 2025-12-31 | refactor: migrate React components and pages to TypeScript (Phase 4) | **TypeScript Phase 4 完了** |
| 完了 | a29d97b | 2025-12-31 | refactor: address code review feedback for Phase 3 migration | Phase 3レビュー対応 |
| 完了 | f86a596 | 2025-12-31 | refactor: migrate API routes and middleware to TypeScript (Phase 3) | **TypeScript Phase 3 完了** |
| 完了 | f520c8e | 2025-12-31 | fix: preserve date selection on booking error | 予約エラー時の日付保持 |
| 完了 | b281c68 | 2025-12-31 | refactor: address code review feedback for Phase 2 migration | Phase 2レビュー対応 |
| 完了 | 4e351fc | 2025-12-31 | refactor: migrate app/_lib to TypeScript (Phase 2) | **TypeScript Phase 2 完了** |
| 完了 | 372d287 | 2025-12-31 | docs: record TypeScript Phase 1 performance baselines | パフォーマンスベースライン記録 |
| 完了 | b518d3c | 2025-12-31 | docs: address review feedback on specs and migration plan | 仕様書・計画レビュー対応 |
| 完了 | ffe6cea | 2025-12-30 | docs: add MockLinkProps interface and version constraint rationale | TypeScript Phase 1 最終レビュー対応 |
| 完了 | 93a624d | 2025-12-30 | refactor: address additional code review feedback | TypeScript Phase 1 追加レビュー対応 |
| 完了 | 3f95872 | 2025-12-30 | docs: address review feedback on TypeScript migration plan | マイグレーション計画レビュー対応 |
| 完了 | bd65479 | 2025-12-30 | refactor: address code review feedback on type definitions | 型定義レビュー対応 |
| 完了 | 897b636 | 2025-12-30 | chore: implement TypeScript Phase 1 foundation setup | **TypeScript Phase 1 基盤構築完了** |
| 完了 | 22e4d50 | 2025-12-30 | docs: address review feedback on TypeScript migration plan | マイグレーション計画初回レビュー対応 |
| 完了 | b881221 | 2025-12-30 | docs: revise TypeScript migration plan with comprehensive updates | マイグレーション計画大幅改訂 |
| 完了 | 4fa9256 | 2025-12-30 | test: improve test isolation and verify DB constraint | テスト分離改善、DB制約検証 |
| 完了 | 71abd86 | 2025-12-30 | fix: update tests for supabaseServer migration and clean up middleware | supabaseServer移行テスト更新 |
| 完了 | a971c01 | 2025-12-30 | fix: use supabaseServer for server-side data fetching and secure account routes | サーバーサイドデータ取得統一 |
| 完了 | c592d8b | 2025-12-30 | docs: complete Phase 5 documentation improvements | Phase 5 ドキュメント改善完了 |
| 完了 | 0509ffe | 2025-12-30 | chore: unify env variables and pin Node.js version | 環境変数統一、Node.js 20.19.6ピン |
| 完了 | 145e183 | 2025-12-30 | fix: resolve CORS error by unifying hostname to localhost | CORSエラー解消 |
| 完了 | f725cf7 | 2025-12-30 | fix: resolve E2E test failure and security vulnerabilities | main重複修正、Node.jsセキュリティ更新 |
| 完了 | 1925e6d | 2025-12-30 | chore: add .nvmrc and fix markdown formatting | .nvmrc追加 |
| 完了 | 9a79d78 | 2025-12-30 | ci: add Playwright E2E test job to CI workflow | E2EテストCI統合 |
| 完了 | 76d047c | 2025-12-28 | feat: implement DB error mapping for user-friendly messages | SQLSTATE→HTTPマッピング、errors.js作成、全77テスト通過 |
| 完了 | 48c9bd1 | 2025-12-25 | fix(db): add canceled status exclusion to overlap constraint | WHERE句でcanceledを除外 |
| 完了 | 9d674cd | 2025-12-25 | feat(db): implement booking concurrency control constraints | DB制約実装、重複データクリーンアップ |
| 完了 | 90756b1 | 2025-12-24 | security: fix glob CLI command injection vulnerability (CVE) | npm overridesでglob 10.5.0に強制アップグレード |
| 完了 | b086aae | 2025-12-24 | CodeRabbit レビューの3つの指摘に対応 | UI/入力改善 |
| 完了 | 27b184c | 2025-12-24 | Claude Code メモリバンク構築 | CLAUDE.md, .specify/memory/ |
| 完了 | 5e95733 | 2025-12-24 | ci: harden smoke test and guard SSG | スモークテスト強化 |
| 完了 | c3d87e0 | 2025-12-23 | Limit SKIP_SSG to build step in CI | テスト時のCabinList空描画を回避 |
| 完了 | 536a8cd | 2025-12-23 | Remove legacy vitest config | vitest.config.ts を削除 |
| 完了 | 25057e5 | 2025-12-23 | Fix CI by switching to JSX and ESM config | app配下JSXを`.jsx`へ統一、`vitest.config.mts`導入 |
| 完了 | 7543ebe | 2025-12-23 | Add CI matrix and update Node docs | CIはNode 20/22を検証、ドキュメント整合 |
| 完了 | dd56f85 | 2025-12-22 | fix: address review feedback and update auth deps | Next.js 14.2.35 / NextAuth 4.24.13 へ更新、認証/テスト/ドキュメント整理 |
| 完了 | b8a43e9 | 2025-12-21 | Added Kilo Code/Spec Kit scaffolding (rules, workflows, constitution, templates, sample spec) plus a short usage README, and refactored the root-level spec plans for clearer structure while leaving application code untouched and only appending minimal cache ignores to .gitignore. | |
| 完了 | ce3c6ef | 2025-12-21 | Next.js 14 App Router のJSコードベースを、挙動を変えずに段階的にTypeScriptへ移行&npm→Bun移行の計画 | |
| 完了 | a84a143 | 2025-12-21 | Merge branch 'main' of GitHub.com:myoshi2891/MasterModernReact_NextJs | |
| 完了 | f883897 | 2025-11-18 | Merge pull request #15 from myoshi2891/dependabot/npm_and_yarn/js-yaml-4.1.1 | |
| 完了 | b95dea4 | 2025-11-16 | Bump js-yaml from 4.1.0 to 4.1.1 | |

## 作業ログ（統合）

このセクションに `docs/README_20251018.md` と `docs/2025-10-13-postgres-maintenance.md` の内容を統合して管理する。

### 2026-01-01 変更内容まとめ（詳細）

#### 概要

- **ローカル環境での並列予約テスト実施・完了**
- DB制約（EXCLUDE, CHECK）の動作検証

#### ローカル並列予約テスト（完了）

- **テスト環境**: Docker postgres:17 + btree_gist拡張
- **検証項目**:
  - 同一期間の重複予約 → 23P01で拒否 ✅
  - 部分的に重なる期間 → 23P01で拒否 ✅
  - チェックアウト日=チェックイン日 → 許容（`[)` 範囲） ✅
  - キャンセル済みとの重複 → 許容（`WHERE (status <> 'canceled')`） ✅
  - startDate >= endDate → 23514で拒否 ✅
  - numGuests = 0 → 23514で拒否 ✅
  - 並列INSERT（競合） → 片方のみ成功、片方は23P01で拒否 ✅
- **結論**: DB制約が期待通りに動作することを確認

---

### 2025-12-31 変更内容まとめ（詳細）

#### 概要

- **TypeScript Phase 2〜6 完了**（完全TypeScript化達成）
- CodeRabbitレビュー対応（6ラウンド）
- アクセシビリティ・UX改善

#### TypeScript Phase 2: データ/認証レイヤー移行（完了）

- 対象ファイル:
  - `app/_lib/errors.js` → `.ts`
  - `app/_lib/guest.js` → `.ts`
  - `app/_lib/supabaseServer.js` → `.ts`
  - `app/_lib/supabaseBrowser.js` → `.ts`
  - `app/_lib/booking.js` → `.ts`
  - `app/_lib/data-service.js` → `.ts`
  - `app/_lib/auth.js` → `.ts`
  - `app/_lib/actions.js` → `.ts`
- 変更内容:
  - `BookingError`クラスと`mapSupabaseError`関数の型定義
  - `DateRange`、`BookingValidationInput`インターフェース追加
  - `BookingWithCabin`、`BookingListItem`、`NewGuestInput`インターフェース追加
  - NextAuth設定とコールバックの型定義（`NextAuthOptions`）
  - Server Actionsの`FormData`ハンドリング型定義
- 効果:
  - データレイヤーの完全な型安全性
  - 全77ユニットテスト + 22コンポーネントテスト通過

#### TypeScript Phase 3: API ルート & Middleware 移行（完了）

- 対象ファイル:
  - `middleware.js` → `middleware.ts`
  - `app/api/auth/[...nextauth]/route.js` → `.ts`
  - `app/api/cabins/[cabinId]/route.js` → `.ts`
  - `app/api/health/route.js` → `.ts`
- 変更内容:
  - `withAuth`設定に`NextAuthMiddlewareOptions`型を適用
  - APIレスポンスに`NextResponse<T>`型を適用
- 効果:
  - ミドルウェアとAPIルートの型安全性確保

#### TypeScript Phase 4: コンポーネント & ページ移行（完了）

- 対象ファイル:
  - コンポーネント: 27ファイル（`.jsx` → `.tsx`）
  - ページ/レイアウト: 18ファイル（`.jsx` → `.tsx`）
- 変更内容:
  - 全コンポーネントにPropsインターフェース定義
  - `params`と`searchParams`の型定義
  - `generateMetadata`と`generateStaticParams`の型定義
  - JSDocコメント追加
- 効果:
  - UIレイヤーの完全な型安全性
  - 開発時の補完とエラー検出が向上

#### TypeScript Phase 5: Strict モード解決 & 最終化（完了）

- 検証内容:
  - app/ディレクトリに.js/.jsxファイルが残っていないことを確認
  - 全検証スイート実行（lint, build, typecheck, test:unit, test:component）
  - Common Errors Checklist（null/undefined、FormData、NextAuthコールバック等）の確認
- 結果:
  - `npm run lint` ✅ No ESLint warnings or errors
  - `npm run build` ✅ Build successful
  - `npm run typecheck` ✅ No type errors
  - `npm run test:unit` ✅ 78 tests passed
  - `npm run test:component` ✅ 22 tests passed

#### TypeScript Phase 6: テストファイル移行（完了）

- 対象ファイル:
  - Unit tests（6ファイル）:
    - `tests/unit/errors.test.js` → `.ts`
    - `tests/unit/guest-utils.test.js` → `.ts`
    - `tests/unit/booking-utils.test.js` → `.ts`
    - `tests/unit/data-service.test.js` → `.ts`
    - `tests/unit/api-cabins-route.test.js` → `.ts`
    - `tests/unit/actions.test.js` → `.ts`
  - Component tests（10ファイル）:
    - `tests/component/app-states.test.jsx` → `.tsx`
    - `tests/component/cabin-detail.test.jsx` → `.tsx`
    - `tests/component/cabin-list.test.jsx` → `.tsx`
    - `tests/component/delete-reservation.test.jsx` → `.tsx`
    - `tests/component/profile-form.test.jsx` → `.tsx`
    - `tests/component/reservation-card.test.jsx` → `.tsx`
    - `tests/component/reservation-form.test.jsx` → `.tsx`
    - `tests/component/reservation.test.jsx` → `.tsx`
    - `tests/component/reservations-page.test.jsx` → `.tsx`
    - `tests/component/text-expander.test.jsx` → `.tsx`
  - E2E tests（1ファイル）:
    - `tests/e2e/home.spec.js` → `.ts`
- 変更内容:
  - Vitest mock型の更新: `vi.fn<() => ReturnType>()` 新構文を採用
  - `NextRequest` 型の使用（api-cabins-route.test.ts）
  - Supabase型に合わせた `created_at` 必須プロパティの追加
  - `Session` 型に `expires` プロパティを追加
  - CommonJS `require` から ESM `import` への変換（E2Eテスト）
  - `tsconfig.json` の `allowJs: false` を設定し純粋TypeScriptコードベース化
- 結果:
  - `npm run lint` ✅ No ESLint warnings or errors
  - `npm run typecheck` ✅ No type errors
  - `npm run test:unit` ✅ 78 tests passed
  - `npm run test:component` ✅ 22 tests passed
  - `npm run build` ✅ Build successful
  - `find app tests -name "*.js" -o -name "*.jsx"` → 結果なし（完全移行確認）
- 効果:
  - 完全TypeScript化達成（app/ および tests/ に .js/.jsx ファイルなし）
  - テストコードでも型安全性を確保
  - `allowJs: false` により新規JSファイルの追加を防止

#### CodeRabbitレビュー対応

- 6ラウンドにわたるレビュー対応
- 主な改善:
  - アクセシビリティ: `aria-label`、`aria-expanded`、`role`属性追加
  - UX: 動的ラベル、レスポンシブ対応、エラーハンドリング
  - コード品質: 空白文字処理改善、JSDoc更新、冗長チェック削除

### 2025-12-30 変更内容まとめ（詳細）

#### 概要

- **TypeScript Phase 1 基盤構築完了**
- E2EテストのCI統合 (Phase 3.1)
- Playwright設定の最適化とCORS問題の解消
- Node.jsセキュリティアップデート
- 環境変数の統一
- Phase 5 ドキュメント整備完了

#### TypeScript Phase 1 基盤構築（完了）

- **パフォーマンスベースライン（2025-12-31計測）**:
  | 項目 | 計測値 | 目標 | 状態 |
  |------|--------|------|------|
  | `npm run typecheck` | **4.2秒** | <30秒 | ✅ 良好 |
  | `npm run build` | **47.6秒** | - | ✅ ベースライン設定 |

  - 計測環境: macOS (Darwin 24.6.0), Node.js 20.19.6
  - 監視基準: build時間が52.4秒（+10%）を超えた場合はアラート対象
  - typecheck が25秒に近づいた場合は incremental 設定の見直しを検討

- 対象ファイル:
  - `tsconfig.json`（新規作成）
  - `types/domain.ts`（新規作成）
  - `types/supabase.ts`（新規作成）
  - `types/next-auth.d.ts`（新規作成）
  - `types/env.d.ts`（新規作成）
  - `types/server-actions.ts`（新規作成）
  - `package.json`（TypeScript依存追加）
  - `.github/workflows/ci.yml`（typecheck追加）
  - `tests/setup.ts`（型定義改善）
  - `vitest.config.mts`（esbuild設定追加）
- 変更内容:
  - TypeScript ~5.7.2 と @types パッケージをインストール
  - strict モードの tsconfig.json を作成（ES2022ターゲット）
  - Supabase Database 型を手動生成（ローカルSupabase未起動のため）
  - ドメイン型（Cabin, Booking, Guest, Settings, Country）を定義
  - NextAuth セッション拡張型を定義（guestId プロパティ）
  - 環境変数の型定義を作成
  - Server Action ヘルパー関数を型安全に実装（getFormString, getFormNumber等）
  - CI に `npm run typecheck` ステップを追加
  - テストモック（MockImageProps, MockLinkProps）の型定義を改善
- 効果:
  - `npm run typecheck` が正常動作（全型チェック通過）
  - 全77ユニットテスト、全22コンポーネントテストが通過
  - Phase 2（データ/認証レイヤー移行）の準備完了
- 関連ドキュメント:
  - [typescript-migration-plan.md](../typescript-migration-plan.md) - 詳細な移行計画

#### Phase 5 ドキュメント整備（完了）

- 対象ファイル:
  - `app/_lib/guest.js`
  - `app/_lib/data-service.js`
  - `docs/review-action-plan.md`
- 変更内容:
  - `normalizeNationalId` 関数のJSDocを拡充（日本語、使用例追加）
  - `cacheFn` のフォールバック処理にコメント追加（React cache の説明）
  - review-action-plan.md の Phase 5 チェックリストを完了に更新
- 効果:
  - コードの意図が明確化され、保守性が向上
  - review-action-plan.md の全 Phase が完了

#### E2EテストのCI統合

- 対象ファイル:
  - `.github/workflows/ci.yml`
  - `playwright.config.ts`
- 変更内容:
  - CIワークフローに `e2e` ジョブを追加（`lint-and-test` 完了後に実行）
  - Playwright chromiumブラウザのインストールステップを追加
  - テストレポートをアーティファクトとして7日間保持
  - 共通環境変数をワークフローレベルに抽出して重複解消
- 効果:
  - PRマージ前にE2Eテストが自動実行される
  - テスト失敗時のデバッグが容易に（レポート参照可能）

#### Playwright設定の最適化

- 対象ファイル:
  - `playwright.config.ts`
- 変更内容:
  - CI環境では本番ビルド（`npm run start`）を使用するよう変更
  - CIでリトライを2回に設定（フレイキーテスト対策）
  - ホスト名を `127.0.0.1` から `localhost` に統一（CORS問題解消）
  - 環境変数をCI設定と統一
- 効果:
  - `NEXTAUTH_URL` とオリジンの一致によりCORSエラーが解消
  - ローカルとCI環境での一貫した動作

#### HTMLセマンティクスの修正

- 対象ファイル:
  - `app/page.jsx`
- 変更内容:
  - ホームページの `<main>` を `<div>` に変更
  - `layout.jsx` に既に `<main>` があるため、重複を解消
- 効果:
  - HTMLセマンティクスの正規化（`<main>` は1ページに1つ）
  - Playwrightの `getByRole("main")` が正しく動作

#### Node.jsセキュリティアップデート

- 対象ファイル:
  - `.nvmrc`
  - `.github/workflows/ci.yml`
- 変更内容:
  - Node.js 20.19.0 → 20.19.6 にアップグレード
  - CIのNode.jsバージョンを 20.19.6 に明示的にピン
- 対応CVE:
  - CVE-2025-23166（高）：async crypto エラーハンドリングでクラッシュ
  - CVE-2025-23167（中）：llhttp HTTP1ヘッダー処理の脆弱性
  - CVE-2025-23165（低）：メモリリークによるDoS
  - CVE-2025-47153（中）：32ビット Debian ビルドのアウトオブバウンズアクセス

#### 環境変数の統一

- 対象ファイル:
  - `playwright.config.ts`
  - `.github/workflows/ci.yml`
- 変更内容:
  - `playwright.config.ts` の環境変数をCI設定と統一
  - `AUTH_SECRET` → `NEXTAUTH_SECRET` に変更
  - `NEXTAUTH_URL` を追加
- 効果:
  - ローカルテストとCI環境での一貫した動作

### 2025-12-28 変更内容まとめ（詳細）

#### 概要

- DB制約エラーのユーザーフレンドリーなエラーマッピング実装
- PostgreSQL SQLSTATE → HTTP ステータスコード + 日本語メッセージの変換
- PII (個人識別情報) を含まないエラーログの実装
- 全77ユニットテスト通過を確認

#### 1. エラーハンドリングモジュールの作成

- 対象ファイル:
  - `app/_lib/errors.js`（新規作成）
  - `tests/unit/errors.test.js`（新規作成）
- 変更内容:
  - `BookingError` クラスの実装（statusCode、codeプロパティ付き）
  - `mapSupabaseError` 関数の実装
    - 23P01 (exclusion violation) → 409 Conflict「既に予約されています」
    - 23514 (check constraint) → 400 Bad Request（日付順序/人数バリデーション）
    - 23505 (unique violation) → 409 Conflict「既に処理済み」
    - P0001 (raise exception) → 適切なコード（CAPACITY_EXCEEDED/CABIN_NOT_FOUND）
  - 未知のエラーは500 Internal Errorにフォールバック、詳細はログのみ
  - エラーメッセージは200文字に切り詰めてログ出力（PII保護）
- テスト結果:
  - 13テスト全て通過（BookingError: 2、mapSupabaseError: 11）

#### 2. Server Actionsへのエラーマッピング適用

- 対象ファイル:
  - `app/_lib/actions.js`
- 変更内容:
  - `mapSupabaseError` のインポート追加
  - `createBooking`、`updateBooking`、`deleteBooking` のエラーハンドリングを更新
  - 汎用的な `new Error("Booking could not be created")` から `mapSupabaseError(error)` へ変更
- 効果:
  - DB制約違反時にユーザーフレンドリーなエラーメッセージを表示
  - HTTPステータスコードが適切に設定される（409/400/404/500）
  - 既存の77ユニットテスト全て通過を確認

#### 3. ドキュメント更新

- 対象ファイル:
  - `CLAUDE.md`
  - `specs/002-booking-concurrency-control/tasks.md`
  - `docs/progress.md`
- 変更内容:
  - ディレクトリ構造に `errors.js` を追加
  - 予約システムの説明に「ユーザーフレンドリーなエラーメッセージ」を追加
  - タスク分解の進捗を更新（エラーコード変換完了、監視ログ定義完了）
  - 本セクション（2025-12-28）を追加

#### 4. 今後の残タスク（specs/002関連）

- [ ] idempotency key の導入可否を決定
- [x] ~~ローカル Supabase で並列予約テストを実施~~ → 本番DBで制約動作を確認（2025-12-30）
  - EXCLUDE制約 `bookings_no_overlap` が正常動作（エラーコード `23P01`）
- [ ] パフォーマンス影響の計測（ステージング環境）
- [ ] 409 連発時の運用判断基準を整理

### 2025-12-24 変更内容まとめ（詳細）

#### 概要

- glob 脆弱性（CVE）対応：npm overrides で 10.5.0 に強制アップグレード
- Claude Code メモリバンク構築（CLAUDE.md, .specify/memory/）
- コードレビュー実施と対応計画の策定
- 仕様書ステータスの明確化

#### 1. セキュリティ対応（CVE）

- 対象ファイル:
  - `package.json`
  - `package-lock.json`
- 変更内容:
  - glob 10.3.10 のコマンドインジェクション脆弱性に対応
  - npm overrides を使用して glob を 10.5.0 に強制アップグレード
  - 影響範囲: glob CLI のみ（ライブラリ API は安全）
  - 対象依存: eslint-config-next, tailwindcss の推移的依存

#### 2. Claude Code メモリバンク構築

- 対象ファイル:
  - `CLAUDE.md`（新規）
  - `.specify/memory/architecture.md`（新規）
  - `.specify/memory/constitution.md`（拡充）
  - `.specify/memory/tech-stack.md`（新規）
  - `.kilocode/rules/02-claude-code-guidelines.md`（新規）
- 変更内容:
  - プロジェクト概要、ディレクトリ構造、主要機能を CLAUDE.md に集約
  - アーキテクチャ設計、技術スタック、品質基準を .specify/memory/ に整理
  - Claude Code 向けガイドラインを追加

#### 3. コードレビュー実施

- 対象: Commit 141a1a6 以降の全改修
- 作成ファイル:
  - `docs/review-action-plan.md`（新規）
  - `docs/review-prompts.md`（新規）
- 主な指摘事項:
  - Critical: specs/002 の DB 制約が未実装（仕様書と実装の乖離）
  - High: SQLSTATE → HTTP マッピングが未実装
  - High: CI に E2E テストが未追加
  - Medium: booking.js 末尾改行なし
- 対応計画: Phase 1〜6 に分割し、別セッションでも実行可能なプロンプト集を作成

#### 4. 仕様書ステータスの明確化

- 対象ファイル:
  - `specs/index.md`
- 変更内容:
  - 002 のステータスを「策定済み」→「設計完了・実装未着手」に更新
  - 仕様書と実装状況の乖離を明示化

### 2025-12-23 変更内容まとめ（詳細）

#### 概要

- CIの安定化（Node 20/22、ビルド時のみSSGスキップ、スモークテスト追加）
- JSXファイ���拡張子の統一とVitest設定のESM化
- サンプル仕様書のパス整合と進捗ログ更新

#### 1. CI安定化とNodeマトリクス調整

- 対象ファイル:
  - `.github/workflows/ci.yml`
- 変更内容:
  - Node 20/22 マトリクスで検証（21は対象外）
  - `next build` のみ `SKIP_SSG=true` を付与
  - `/api/health` を叩くスモークテストを追加

#### 2. JSX/テスト設定の整合

- 対象ファイル:
  - `app/**/*.jsx`
  - `vitest.config.mts`
- 変更内容:
  - JSXを含む `.js` を `.jsx` へ統一
  - Vitest設定を `.mts` 化してESMロードエラーを解消

#### 3. 仕様書/進捗ログの更新

- 対象ファイル:
  - `specs/001-sample-feature/plan.md`
  - `docs/progress.md`
- 変更内容:
  - サンプルの参照パスを `.jsx` に整合
  - 2025-12-23 の進捗を追記

### 2025-12-22 変更内容まとめ（詳細）

#### 概要

- レビュー指摘のUI/入力/アクセシビリティ対応を反映
- Next.js 14.2.35 と NextAuth 4.24.13（安定版）へ更新
- 認証フローを `next-auth/react` に統一し、サーバーアクション依存を解消
- 仕様書/テスト計画/運用ドキュメントを現状に合わせて更新
- ユニット/コンポーネントテストを実行して合格確認

#### 1. 認証基盤の安定版移行

- 対象ファイル:
  - `package.json`, `package-lock.json`
  - `app/_lib/auth.js`
  - `middleware.js`
  - `app/_components/SignInButton.js`
  - `app/_components/SignOutButton.js`
- 変更内容:
  - `next` を 14.2.35 に更新
  - `next-auth` を 4.24.13 に更新（v5 beta から安定版へ移行）
  - `getServerSession` + `withAuth` に統一
  - `signIn`/`signOut` を `next-auth/react` のクライアント呼び出しへ移行

#### 2. UI/入力の安全性・可読性改善

- 対象ファイル:
  - `app/_components/DateSelector.js`
  - `app/_components/NavigationMenu.js`
  - `app/_components/ReservationCard.js`
  - `app/_components/UpdateProfileForm.js`
  - `app/_lib/actions.js`
  - `app/_lib/booking.js`
- 変更内容:
  - `<button>` に `type="button"` を明示
  - モバイルメニューに `aria-controls` を追加
  - 未使用変数の削除、日付の再パース回数を削減
  - observations の null ガード、bookingId の型整合性確保
  - `isDateDisabled` で `bookedDates` が null の場合も安全に動作

#### 3. 仕様書・運用ドキュメントの更新

- 対象ファイル:
  - `README.md`
  - `README_next_action.md`
  - `TEST_PLAN.md`
  - `specs/002-booking-concurrency-control/spec.md`
- 変更内容:
  - NextAuth バージョンの更新（v5→v4）に整合
  - テスト対象・ドキュメント記述の整合性を修正

#### 4. テスト実行

- 実行コマンド:
  - `npm run test:unit`
  - `npm run test:component`
- 結果:
  - 全テスト成功（既存の `form action` 警告は継続）

#### 5. 予約バリデーション/テスト追加（完了: 2025-12-22）

- 対象ファイル:
  - `tests/unit/actions.test.js`
  - `app/_lib/booking.js`
  - `app/_lib/actions.js`
  - `tests/unit/booking-utils.test.js`
- 変更内容:
  - 重複予約テストを削除し、deleteBooking の `guestId=null` ケースを追加
  - observations の文字数トリミング検証を追加
  - `validateBookingInput` に `regularPrice`/`discount` の検証を追加
  - `createBooking` に `regularPrice`/`discount` を渡すよう更新
  - 割引境界値テストを調整

### 2025-12-21 変更内容まとめ（詳細）

#### 概要

- Kilo Code / Spec Kit の最小構成を導入
- spec/plan/tasks のテンプレートとサンプルを追加
- 既存の移行計画（TypeScript 移行 / npm → Bun）を構造化
- Spec Kit 関連キャッシュを `.gitignore` に追加

#### 1. Kilo Code ルール/ワークフローの土台追加

- 対象ファイル:
  - `.kilocode/rules/00-readme.md`
  - `.kilocode/rules/01-engineering-standards.md`
  - `.kilocode/workflows/submit-pr.md`
  - `.kilocode/launchConfig.json`
  - `README_kilocode_speckit.md`
- 原因:
  - ルール・PR 手順・運用ルールが未整備で属人化しやすい
  - Spec Kit 運用の入口がなく、どこに何があるかが分かりづらい
- 具体的修正:
  - ルールディレクトリにガイドと土台ルール（placeholder）を追加
  - PR 提出フローを明文化（ブランチ命名、変更点まとめ、テスト記載、チェックリスト）
  - Kilo Code 起動設定にデフォルト workflow を設定
  - 導入メモで全体構成と運用ルールを説明
- 変更例:

```json
{
  "project": {
    "name": "TODO",
    "root": "."
  },
  "defaults": {
    "workflow": "submit-pr"
  }
}
```

```markdown
## 1. ブランチ命名
- feat/<short>
- fix/<short>
- chore/<short>
- docs/<short>
```

#### 2. Spec Kit 憲法/テンプレートの追加

- 対象ファイル:
  - `.specify/memory/constitution.md`
  - `.specify/templates/spec.md.tpl`
  - `.specify/templates/plan.md.tpl`
  - `.specify/templates/tasks.md.tpl`
- 原因:
  - spec/plan/tasks の記載フォーマットが統一されていない
  - 品質・非機能・セキュリティの合意事項が起点として存在しない
- 具体的修正:
  - 憲法（Draft）を追加し、合意内容を記載する場所を確保
  - spec/plan/tasks のテンプレートを追加し、最低限の見出し構成を標準化
- 変更例:

```markdown
# Spec: <feature-name>

## 背景 / 目的
TODO

## 受入基準
TODO
```

```markdown
## 品質基準
- TODO: リント/フォーマット、レビュー基準、必須テスト
```

#### 3. サンプル spec の追加

- 対象ファイル:
  - `specs/001-sample-feature/spec.md`
  - `specs/001-sample-feature/plan.md`
  - `specs/001-sample-feature/tasks.md`
- 原因:
  - テンプレートの実例がなく、運用開始時の迷いが発生しやすい
- 具体的修正:
  - 例示用の spec/plan/tasks を追加し、書き換え前提のサンプルとして配置
- 変更例:

```markdown
## タスク分解
- [ ] 例: データ取得関数を追加
- [ ] 例: UI へ表示する
- [ ] 例: テストを追加
```

#### 4. 既存の移行計画ドキュメントを構造化

- 対象ファイル:
  - `typescript-migration-plan.md`
  - `npm-to-bun-migration-plan.md`
- 原因:
  - 既存の計画ドキュメントが章立て不足で追跡しづらい
- 具体的修正:
  - YAML フロントマターで `name`/`description` を付与
  - Summary / Requirements / Scope / Files / Action items / Testing / Risks を追加
  - 具体的なタスク分解を `Action items` に整理
- 変更例:

```markdown
---
name: typescript-migration-plan
description: Next.js App Router TS migration plan (phased)
---

## Action items
- [ ] Add TypeScript tooling and config
- [ ] Generate Supabase types
```

```markdown
## Requirements
- Replace npm with Bun for installs and `package.json` script execution
- Use `bun.lockb` as the single source of truth
```

#### 5. Spec Kit キャッシュの ignore 追加

- 対象ファイル: `.gitignore`
- 原因:
  - Kilo Code / Spec Kit のキャッシュが Git に出現し作業ノイズになる
- 具体的修正:
  - `.kilocode/.cache/` と `.specify/.cache/` を除外対象に追加
- 変更例:

```gitignore
# Kilo Code / Spec Kit cache
.kilocode/.cache/
.specify/.cache/
```

#### 成果/効果

- 仕様策定の入口（spec/plan/tasks）と進め方が可視化され、新規機能の立ち上げがスムーズになる
- PR 提出フローが明文化され、レビュー観点と必要情報の抜け漏れが減る
- 計画ドキュメントの構造化により、移行作業の進捗と依存関係が追いやすくなる
- キャッシュ除外により、差分のノイズが減りレビュー効率が向上する

#### 運用ルール

- 新規機能は `specs/NNN-<feature-name>/` を作成し、`spec.md`/`plan.md`/`tasks.md` を追加する
- ルール類は `.kilocode/rules/` に集約し、1ファイル=1テーマで短く保つ
- 変更時はチーム合意のうえで更新し、`README_kilocode_speckit.md` に要点を反映する
- PR 提出時は `.kilocode/workflows/submit-pr.md` のチェックリストを満たす

### 2025-10-18 変更内容まとめ（詳細）

#### 概要

- Supabase クライアント再編と認証機能の改善
- 予約システムの機能強化と UX 向上
- UI パフォーマンスの最適化
- Docker 開発環境の整備
- ドキュメントと設定の改善

#### 1. セキュリティ対策の実施

- 対象ファイル: `next.config.mjs`
- 現状の課題: `lh3.googleusercontent.com` の `remotePatterns` にパス制限がなく許可範囲が広い
- 対策内容:
  - `pathname: "/a/**"` を追加し、Google アバター画像の取得を `/a/` 配下に限定
  - Supabase ストレージの配信パスを `remotePatterns` で明示
- 変更例:

```javascript
// 変更前
{
  protocol: "https",
  hostname: "lh3.googleusercontent.com"
}

// 変更後
{
  protocol: "https",
  hostname: "lh3.googleusercontent.com",
  pathname: "/a/**"
}
```

- 影響箇所:
  - `app/_components/ReservationForm.js` のプロフィール画像表示
  - `app/_components/NavigationMenu.js` のプロフィール画像表示
- 効果:
  - 外部リソースの取得範囲を最小化し、意図しないリソースへのアクセスを防止

#### 2. Supabase クライアント再編と認証周り

- 対象ファイル:
  - `app/_lib/supabaseServer.js`
  - `app/_lib/supabaseBrowser.js`
  - `app/_lib/actions.js`
  - `app/_lib/data-service.js`
- 対応内容:
  - サーバー専用クライアントを新設し、`SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` の存在チェックと `server-only` ガードを追加
  - ブラウザ用クライアントを分離し、`NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_KEY` の存在チェックと `persistSession: true` を明示
  - サーバー/ブラウザのクライアントを用途ごとに切り替え、誤用を防止
  - 旧 `app/_lib/supabase.js`/`app/_lib/supabase-admin.js` を削除して責務を整理
- 効果:
  - サービスロールキーの露出リスクを低減
  - RLS をバイパスする操作をサーバー専用に限定

#### 3. 予約システムの改善（バグ修正 + UX）

- 対象ファイル:
  - `app/_lib/data-service.js`
  - `app/account/reservations/page.js`
  - `app/account/reservations/edit/[bookingId]/page.js`
  - `app/_components/ReservationCard.js`
- 発生していた問題:
  - `Unhandled Runtime Error: Booking could not get loaded`
  - 予約編集ページで `cabins` 情報が取得できず `maxCapacity` が空になる
- 原因:
  - `getBooking` でブラウザクライアントを使用していた
  - 予約詳細取得で `cabins` の関連情報が未取得だった
- 対応内容:
  - `getBooking` を `supabaseServer` に統一し、`cabins(name, maxCapacity, image)` を join
  - 予約編集ページで `try/catch` を追加し、失敗時のエラーを明示化
  - `booking?.numGuests` などを null セーフに取得して初期値の欠落を回避
  - 予約一覧ページを `dynamic = "force-dynamic"` にし、セッションを常に最新化
  - 予約カードの画像 `sizes` とレイアウトを調整し、モバイル表示を改善
- 変更例:

```javascript
export async function getBooking(id) {
  const { data, error } = await supabaseServer
    .from("bookings")
    .select("*, cabins(name, maxCapacity, image)")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    throw new Error("Booking could not get loaded");
  }

  if (!data) {
    throw new Error("Booking not found");
  }

  return data;
}
```

```javascript
const numGuests = booking?.numGuests ?? 1;
const observations = booking?.observations ?? "";
const maxCapacity = booking?.cabins?.maxCapacity ?? 4;
```

- 効果:
  - 予約編集ページの取得エラーを抑止し、フォーム表示が安定
  - サーバー側でのデータ取得に統一され、挙動の一貫性が向上

#### 4. UI とパフォーマンスの改善

- 対象ファイル:
  - `app/layout.js`
  - `app/page.js`
  - `app/_components/ReservationCard.js`
- 対応内容:
  - Google Fonts の配信を停止し、`app/fonts/` の可変フォントを `next/font/local` で配信
  - ヒーロー見出しのサイズを `text-4xl → sm:text-6xl → md:text-8xl` に調整
  - 画像 `sizes` などを明示して LCP を改善
- 効果:
  - フォント読み込みが安定し、CLS 低減
  - 画面幅ごとの読みやすさが向上

#### 5. 開発環境の整備（Docker）

- 対象ファイル:
  - `Dockerfile`
  - `docker-compose.yml`
  - `docker/start-dev.sh`
  - `docker/postgres-healthcheck.sh`
  - `docker/initdb/00_create_roles.sql`
  - `docker/initdb/01_create_supabase_admin.sh`
  - `docker/initdb/05_set_timezone.sql`
  - `docker/initdb/10_apply_migrations.sh`
- 対応内容:
  - `Dockerfile` で `npm ci` を利用し、`gosu` と非 root 実行を整備
  - `.next` キャッシュ用ボリュームの追加とヘルスチェックの刷新
  - Supabase 管理ロールの作成/更新時に `RAISE NOTICE` を追加しログを可視化
  - タイムゾーン設定を SQL で自動化し、初期化スクリプトの順序を明確化
- 変更例:

```sql
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_admin') THEN
    EXECUTE format(
      'CREATE ROLE supabase_admin LOGIN SUPERUSER PASSWORD %L',
      :'admin_password'
    );
    RAISE NOTICE 'Created role supabase_admin with superuser privileges';
    RETURN;
  END IF;

  EXECUTE format(
    'ALTER ROLE supabase_admin WITH PASSWORD %L',
    :'admin_password'
  );
  RAISE NOTICE 'Updated password for existing supabase_admin role';
END
$$;
```

```bash
echo "[supabase-admin] Database role setup completed successfully" >&2
```

- 効果:
  - 初期化の再現性向上とログの明確化
  - 開発環境起動時のトラブルシュートが容易化

#### 6. ドキュメントと設定の改善

- 対象ファイル:
  - `README_supabase.md`
  - `.gitignore`
  - `package.json`
- 対応内容:
  - README の見出しレベルとコードブロックの言語指定を統一
  - `eslint` を `^8.57.0` に固定
  - Playwright/IDE キャッシュを `.gitignore` に追加

#### 7. 追加の改善内容（本日分の詳細）

- 予約編集ページのエラーハンドリング強化:
  - 取得失敗時に `予約データの取得に失敗しました。予約ID: ${bookingId}` を明示
  - `booking` 欠落時は例外として扱い、フォーム描画時の不整合を防止
- 開発環境スクリプトの堅牢性向上:
  - `docker/start-dev.sh` で `gosu` 未導入時の警告とフォールバック実行を追加
- レスポンシブデザインの強化:
  - `app/page.js` のヒーロー見出しを段階的に拡大し、視認性を改善

#### 継続的な改善項目

1. セキュリティ強化

   - 外部リソースのパス制限を定期的に見直す
   - 認証エラーハンドリ���グの強化

1. パフォーマンス最適化

   - クエリの更なる最適化
   - クライアント/サーバー境界の整理

1. 運用改善

   - ログ出力の標準化
   - エラーメッセージの多言語対応

### 2025-10-13 作業メモ（Postgres メンテナンス）

#### 1. Postgres ボリューム初期化エラー調査と対応

- `docker compose up --build` 時に `data directory has wrong ownership` が発生したため、`mastermodernreact_nextjs_postgres-data` ボリュームを調査
- BusyBox コンテナで `chown -R 70:70 /var/lib/postgresql/data` を実施しても改善せず、Supabase イメージの `postgres` UID/GID が `101:102` であることを確認
- `chown -R 101:102 /var/lib/postgresql/data` と `chmod 700 /var/lib/postgresql/data /var/lib/postgresql/data/pgdata` を実施
- ボリューム内に `pgdata` サブディレクトリが存在し、`PG_VERSION` が親ディレクトリに無いことを確認。`pgdata` 配下のデータを `/var/lib/postgresql/data` 直下へ移動し、`pgdata` を削除
- `docker-compose.yml` の `PGDATA` を `/var/lib/postgresql/data` に修正し、再起動でエラー解消

#### 2. タイムゾーン設定

- `docker-compose.yml` に `TZ: Asia/Tokyo` を追加
- `docker/initdb/05_set_timezone.sql` を作成し、`ALTER SYSTEM SET timezone = 'Asia/Tokyo'; SELECT pg_reload_conf();` を追加

#### 3. 環境変数と Next.js 側設定

- `.env` と `.env.local` の `POSTGRES_USER` を `postgres` に変更
- `docker-compose.yml` の `web` サービスで `DATABASE_URL` に `?options=-c%20TimeZone=Asia/Tokyo` を追加してアプリ側のタイムゾーンも合わせた
- `docker-compose.yml` の `postgres` サービスにおいて、`POSTGRES_USER` を環境変数参照からリテラル `postgres` に固定

#### 4. コンテナ再生成と認証エラー対応

- `docker compose down` → `docker compose up --build`（必要に応じて `--force-recreate`）を繰り返し、更新した環境変数と設定を反映
- `docker inspect` と `docker exec env` でコンテナ内の `POSTGRES_USER=postgres` を確認
- `supabase_map` に存在しないユーザーで peer 認証しようとするログを解消するため、環境変数の修正後に古いユーザー名を使うヘルスチェックを更新 (`pg_isready -U postgres`)
- 既存データベースに `postgres` ロールが無かったため、`psql` で `CREATE ROLE postgres WITH LOGIN SUPERUSER PASSWORD '<PASSWORD>';` を実行
- `docker compose logs postgres` で `peer authentication failed` ログが出ていないことを確認

#### 5. 動作確認

- `docker compose ps` で `postgres` コンテナが `healthy` であることを確認
- 必要に応じて `SHOW timezone;` や `SELECT now();` を実行し、`Asia/Tokyo` が反映されていることを確認

#### 6. 留意点

- 環境変数を変更した際は必ず `docker compose down` でコンテナを削除してから `docker compose up --build`（または `up -d --force-recreate`）で再生成すること
- 既存データを保持する場合は所有権とパーミッション (`chown`, `chmod`) を再確認し、`PG_VERSION` を含めたファイル構成が `PGDATA` の期待と一致しているかをチェックする
