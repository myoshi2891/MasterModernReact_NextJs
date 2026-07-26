# 改善プラン索引

`.agents/skills/improve` スキルによるコードベース監査（effort: **standard**、
全9カテゴリ）の成果物。監査基準コミット: `5457faa`（2026-07-04）。

各プランは**このセッションの文脈を持たない実行者**（別のエージェント/開発者）が
単独で実行・検証できるよう自己完結で書かれている。実行者は着手時に各プラン冒頭の
Drift check を必ず実行すること。

## 実行順序とステータス

| # | プラン | カテゴリ | Priority | Effort | 依存 | Status |
|---|--------|---------|----------|--------|------|--------|
| 001 | [予約編集ページの IDOR 解消](001-secure-reservation-edit-page.md) | security | P1 | S | なし | DONE |
| 002 | [クリティカルパスのテスト補強](002-critical-path-test-coverage.md) | tests | P2 | M | なし | TODO |
| 003 | [data-service のクエリ効率改善](003-data-service-efficiency.md) | perf | P2 | M | 002 | TODO |
| 004 | [ドキュメントドリフト解消](004-docs-drift-sync.md) | docs | P2 | M | なし | TODO |
| 005 | [Cache Components スパイク](005-cache-components-spike.md) | direction | P3 | M | なし | TODO |

Plan 005 に必須依存はない。Plan 003 の後に実施する順序は任意の推奨であり、
Plan 003 が未完了でも Plan 005 を開始できる。

依存グラフ:

```text
001 (独立・最優先)
002 ──→ 003 ⋯→ 005
004 (独立・随時)
```

`──→` は必須依存、`⋯→` は任意の推奨順序を表す。

## 選定方針の記録

自動選定モードで実施（レバレッジ = 影響 ÷ 工数 × 確度 の上位 + 方向性提案1件）。
所見テーブル全体は下記。プラン化しなかった所見は「保留・却下」に理由付きで記録し、
次回監査での再報告を防ぐ。

## 監査所見サマリ（Vet 済み）

すべて引用箇所をアドバイザ自身が開いて確認済み。

### プラン化した所見

| ID | 所見 | 確度 | 行き先 |
|----|------|------|--------|
| SEC-01 | 予約編集ページに認可なし — ログイン済みゲストが他人の予約を URL 操作で閲覧可能（IDOR）。書き込み側には所有権チェックあり、読み取りのみ欠落 | HIGH | 001 |
| TEST-02 | `session.user.guestId` を生成する Auth.js コールバック（全認可の要）が未テスト | HIGH | 002 |
| TEST-01 | PII を書き込む `updateGuest` アクションが未テスト | HIGH | 002 |
| TEST-04 | `getBooking`/`getBookings`/`getSettings`/`getGuest`/`createGuest` が未テスト | HIGH | 002 |
| PERF-01 | `getCabin`/`getSettings` がリクエストスコープキャッシュ未使用 — 詳細ページで同一クエリ2回 | HIGH | 003 |
| PERF-02 | `getBookedDatesByCabinId` が `select("*")` で予約全カラム（他ゲスト PII 含む）を取得し2列しか使わない | HIGH | 003 |
| PERF-04 | 予約の更新/削除が所有権確認のため全予約履歴＋join をフェッチ | HIGH | 003 |
| PERF-03 | `Reservation` で `auth()` がデータ取得後に直列実行 | MED | 003 |
| TECHDEBT-01 | `data-service.ts` 末尾に旧チュートリアルの CRUD 死コード約64行 | HIGH | 003 |
| TECHDEBT-02 | `getCabinPrice` は呼び出し元ゼロの未使用 export | HIGH | 003 |
| DOCS-01 | `tech-stack.md` が全コアバージョンで1メジャー以上古い（Next 14 / NextAuth v4 表記） | HIGH | 004 |
| DOCS-02 | `README.md` が Next 15 表記＋存在しない `.js` パスを多数参照 | HIGH | 004 |
| DOCS-03 | `CLAUDE.md` の env ブロックが Auth.js v5 で使わない `NEXTAUTH_*` を記載、本番必須の `HASH_SALT` 欠落 | HIGH | 004 |
| DOCS-04 | `README_next_action.md` が npm / Next 14 前提のまま | HIGH | 004 |
| DIR-01 | Cache Components 採用によるキャビン詳細の静的化 — インテントドキュメントに既知の未解決事項として明記済み | HIGH | 005 |

### 保留・却下した所見（considered and rejected / deferred）

| ID | 所見 | 判断 | 理由 |
|----|------|------|------|
| BUG-01 | `calculateNumNights` が同日レンジで throw し得る（DateSelector/ReservationForm のレンダ中） | 保留 | 確度 MED。再現経路が react-day-picker の min 制約に依存し未確認。防御的ガードは 003 実施後に再評価 |
| BUG-02 | `updateBooking` の容量チェックが `maxCapacity` 欠落時にスキップされる | 保留 | 003 の `getBookingOwnership` 導入で join が明示化されるため、その後に再評価 |
| BUG-03 | update 側は create 側の `validateBookingInput` を再実行しない | 却下（by-design 寄り） | update は `numGuests`/`observations` のみ変更可能で日付は不変。明示的ホワイトリスト更新であり実害なし |
| PERF-05 | `getBookings` にページネーションなし | 保留 | 現規模では実害小。予約数が伸びた時点でプラン化 |
| TEST-03 | 編集ページの認可テスト欠如 | 001 に統合 | SEC-01 の回帰テストとして 001 の Step 1 に含めた |
| TEST-05 | `DateSelector` の直接テストなし | 保留 | 親経由の部分カバレッジあり。BUG-01 の再評価と合わせて検討 |
| TECHDEBT-03 | 翻訳文字列の `{placeholder}` 補間が約9箇所で手書き重複 | 保留 | S 工数の良化だが独立プラン化するほどのレバレッジではない。DIR-02（next-intl）採用時に自然解消する可能性 |
| TECHDEBT-04 | `ReservationReminder` が英語ハードコード（i18n 未適用） | 保留 | S 工数。次バッチの筆頭候補 |
| TECHDEBT-05 | `getBookings` の `as unknown as` 二重キャスト | 保留 | 唯一の型エスケープ。修正は select 射影の型付けとセットで行うべきで、003 の変更が落ち着いてから |
| DEPS-01 | next-auth が beta 固定（認証のクリティカルパス） | 監視項目 | v5 stable リリースを watch し、リリース時にアップグレードプランを起こす |
| DEPS-02 | `tsconfig.json` の `ignoreDeprecations: "6.0"` が抑止している警告が不明 | 保留 | 調査は S 工数。TS 7 前に必ず解消すること |
| DEPS-03 | 依存ピン戦略が不統一、`packageManager`/`engines` 未設定 | 保留 | 低リスクの整備項目 |
| DX-01 | CI に依存キャッシュなし、e2e ジョブで重複ビルド | 保留（次バッチ筆頭） | S 工数で CI 時間を確実に短縮。今回の上位5件に僅差で漏れた |
| DX-02 | pre-commit フックなし（TDD ルールは規約のみで強制） | 保留 | DX-01 とセットで CI/DX プランにするのが効率的 |
| DIR-02 | next-intl によるサーバーサイド i18n 移行 | 保留 | インテントドキュメントに明記された方向だが工数 L で、DIR-01 とレンダリングモデルが競合。005 の結論後に順序付け |
| DIR-03 | StructuredLogger にトランスポートがなく利用箇所も2箇所のみ | 保留 | 安価な改善（ドキュメント修正＋呼び出し追加）だが優先度は上位5件未満 |
| DIR-04 | 予約モデルの未使用カラム（isPaid/extrasPrice/hasBreakfast/status）を活かす確認・朝食機能 | 要判断 | ポートフォリオ免責バナーと方向性が衝突し得るため、メンテナ判断が先。決済（Stripe）は推奨しない |
| （依存監査） | `bun audit`: 26 advisories（high 14）はすべてビルド/開発ツールチェーン経由（postcss/vite/rollup/eslint/vitest 系）。本番ランタイム到達なし | 保留 | `bun update` での transitive 更新で解消見込み。DX バッチに含める |

### 監査で問題なしと確認した点（再監査不要）

- Server Actions のミューテーションは明示的ホワイトリスト更新（mass assignment なし）、`createBooking` の `guestId` はセッション由来
- `deleteBooking` / `updateBooking` の所有権チェックは正しく存在（効率のみ 003 で改善）
- 秘密情報のコミットなし（追跡対象は空値の `.env.example` のみ）
- ログの PII 対策済み（guestId / email はハッシュ化、エラーメッセージ切り詰め）
- クライアントへのスタックトレース漏洩なし、XSS シンクなし、open redirect なし
- `CLAUDE.md` のコンポーネント数・CI 記述・ISR 記述は実態と一致（env ブロックのみ 004 で修正）

## 監査しなかった範囲（standard レベルの制約）

- Supabase 側の RLS ポリシー・DB スキーマ・EXCLUDE 制約の実定義（リポジトリ外）
- E2E テストの実行時挙動（テストコードの静的読解のみ）
- 本番デプロイ環境（Vercel）の設定・ヘッダー・CSP
- `tests/e2e/` 自体の品質監査

## 運用メモ

- 実行者は完了時にこの表の Status を `TODO → DONE`（中断時は `BLOCKED`）に更新すること
- 本ディレクトリへのコミット前に PII チェックを必ず実行すること:

```bash
git diff --cached | grep -E '^\+[^+]' | grep -E '(/Users/|/home/|C:\\Users\\)' | grep -vE 'johndoe'
```

出力が空であることを確認してからコミットする（`.claude/rules/no-absolute-paths.md`）。
