# Plan 005: Cache Components（"use cache"）でキャビン詳細の静的化を検証するスパイク

> **Executor instructions**: これは**スパイク（調査）プラン**であり、成果物は
> レポートとプロトタイプブランチの検証結果である。本番コードへのマージを
> 目的としない。各ステップの検証コマンドを実行し、期待結果を確認してから
> 次に進むこと。「STOP conditions」のいずれかが発生したら、中断して報告する
> こと。完了したら `plans/README.md` の該当ステータス行を更新すること。
>
> **Drift check (run first)**: `git diff --stat 5457faa..HEAD -- "app/cabins/" "app/_lib/data-service.ts" "app/_lib/actions.ts" "next.config.mjs"`
> in-scope ファイルに変更があれば、「Current state」の抜粋と実コードを突き合わせ、
> 不一致があれば STOP condition として扱うこと。

## Status

- **Priority**: P3
- **Effort**: M
- **Risk**: LOW（調査のみ。プロトタイプは使い捨てブランチで実施）
- **Depends on**: none
- **Recommended order**: plans/003-data-service-efficiency.md の後
  （`getCabin` のキャッシュラップ後の形で調査できるため。003 未実施でも実行可能で、
  その場合はレポートに明記すること）
- **Category**: direction
- **Planned at**: commit `5457faa`, 2026-07-04

## Why this matters

Next.js 16 では既定が request-time レンダリングとなり、`/cabins/[cabinId]` は
`generateStaticParams()` が定義されているにもかかわらず動的描画になっている。
これは `CLAUDE.md`（「SSG/ISR 復元には Cache Components (PPR / "use cache") の
採用が別途必要」）と `.specify/memory/architecture.md` の両方に**既知の未解決
事項として明記**されている。キャビン詳細は購入前の最重要ページで、データは
安定（キャビン情報は稀にしか変わらない）。このスパイクは「採用できるか・
どのように・何が壊れるか」に答え、go/no-go 判断材料を作る。

## Current state

- `app/cabins/page.tsx` — 一覧。`export const revalidate = 3600`（ISR）
- `app/cabins/[cabinId]/page.tsx` — 詳細。`generateStaticParams()`（43〜51行）と
  `generateMetadata()` を持つが、Next 16 では動的描画。`SKIP_SSG === "true"` で
  SSG をスキップする分岐がある（25行、44行）
- `app/_lib/data-service.ts` — `getCabin()` は Supabase から取得
- `app/_lib/actions.ts` — `createBooking` 成功時に
  `revalidatePath("/account/reservations")` と
  `revalidatePath(`/cabins/${cabinId}`)` を実行（242〜243行）。
  キャッシュ無効化フローはこの `revalidatePath` に依存している
- `next.config.mjs` — `cacheComponents` / experimental フラグは**未設定**
- ページ内構造: 詳細ページは `<Suspense>` で `Reservation`（auth + 予約状況 =
  動的パート）を包んでおり、PPR の静的シェル + 動的ホールの形に**既に適合**
  している

検証コマンド（Recon で実在確認済み）: `bun run build` / `bun run test:all` /
`bun run typecheck` / `bun run lint`

## Steps

### Step 1: 現状ベースラインの記録

1. `bun run build` を実行し、ビルド出力のルート一覧から `/cabins/[cabinId]` の
   レンダリング区分（Static / Dynamic / Partial）表記を記録する
2. インストール済み Next.js の正確なバージョンを記録:
   `bun pm ls | grep next` または `cat node_modules/next/package.json | grep '"version"'`

### Step 2: 一次情報の調査（コード変更なし)

次を調査し、レポートの「事実」セクションに出典付きでまとめる:

1. インストールされている Next.js 16.x マイナーで `cacheComponents`
   （旧 PPR / dynamicIO）が stable か experimental か
2. `"use cache"` ディレクティブの適用単位（ファイル / 関数）と、
   `cacheLife` / `cacheTag` API の現行シグネチャ
3. `revalidatePath` と cache tags の相互作用 — 既存の `createBooking` の
   無効化フローがそのまま機能するか、`cacheTag` ベースへの移行が必要か
4. `generateStaticParams` との併用挙動（ビルド時列挙 + "use cache" の関係）
5. `SKIP_SSG` 環境変数運用（CI がビルド時 DB アクセスを避けるための既存の仕組み）
   と衝突しないか

### Step 3: 使い捨てブランチでプロトタイプ

1. `git branch --show-current > /tmp/plan-005-start-branch` と
   `test -s /tmp/plan-005-start-branch` を実行し、開始ブランチ名を保存する
   （detached HEAD の場合は STOP）
2. `test -z "$(git status --porcelain)"` を実行し、作業ツリーが clean であることを
   確認する（出力がある場合は STOP）
3. `test -z "$(git branch --list 'spike/cache-components')"` を実行し、同名ブランチが
   存在しないことを確認する（存在する場合は STOP）
4. `git switch -c spike/cache-components` で使い捨てブランチを作成する
   （**main / dev へのマージ・push はしない**）
5. 最小の変更で試す（候補、調査結果に応じて選択）:
   - `next.config.mjs` に `cacheComponents: true`（または該当フラグ）を設定
   - `getCabin` に `"use cache"` + `cacheTag("cabin-" + id)` を付与、または
     ページレベルで `"use cache"` を試す
6. `bun run build` で `/cabins/[cabinId]` の区分が Static / Partial に変わるかを
   確認し、出力を記録
7. `bun run test:all` を実行し、何が壊れるか（特に E2E）を記録
8. 予約作成 → キャビン詳細の予約済み日付が更新されるか（無効化フロー）を
   `bun run dev` + 手動または E2E で確認できる範囲で検証
9. 検証結果とプロトタイプを `/tmp/plan-005-prototype.patch` および
   `/tmp/plan-005-prototype-stat.txt` に保存した後、次を実行して変更を破棄する。
   未追跡ファイルがある場合は restore を実行せず STOP する。clean にならない
   場合も STOP し、強制リセットしない

```bash
git diff --binary HEAD > /tmp/plan-005-prototype.patch
git diff --stat HEAD > /tmp/plan-005-prototype-stat.txt
test -z "$(git ls-files --others --exclude-standard)"
git restore --staged --worktree -- next.config.mjs app/_lib/data-service.ts app/_lib/actions.ts app/cabins/
test -z "$(git status --porcelain)"
```

10. 保存した開始ブランチへ戻り、スパイクブランチを削除する

```bash
git switch "$(cat /tmp/plan-005-start-branch)"
git branch -d spike/cache-components
```

### Step 4: レポート作成

`plans/005-report-cache-components.md` を作成し、以下を含める:

- 事実（バージョン、フラグの stable/experimental、ビルド出力の前後比較）
- 動いたもの / 壊れたもの（テスト結果の生ログ要約）
- 無効化フローの結論（`revalidatePath` 継続可否、`cacheTag` 移行の要否）
- go/no-go 推奨と、go の場合の本実装プラン骨子（触るファイル、テスト戦略、
  リスク）
- 使い捨てブランチの diff 要約（`spike/cache-components` ブランチ名を記載）
- 「スパイクブランチを削除済み」と明記

コミット（レポートのみ）: `docs(plans): add cache components spike report`
コミット前に PII チェックを実行（`plans/README.md` 参照）。

## Hard boundaries

- **In scope**: 調査、使い捨てブランチ上のプロトタイプ、レポート作成
- **Out of scope**: dev / main ブランチへの実装コミット、`push`、依存の追加・
  更新、`app/cabins/` 以外のページの静的化、i18n のサーバー移行
  （別所見 DIR-02 — レンダリングモデルが競合するため本スパイクに混ぜない）

## Done criteria（機械検証可能）

- `plans/005-report-cache-components.md` が存在し、「go/no-go」見出しを含む
- `test -z "$(git branch --list 'spike/cache-components')"` — スパイクブランチが
  削除済み
- `grep -nF "spike/cache-components" plans/005-report-cache-components.md` — 1件以上
- `grep -nF "スパイクブランチを削除済み" plans/005-report-cache-components.md`
  — 1件以上
- `test "$(git branch --show-current)" = "$(cat /tmp/plan-005-start-branch)"` — 開始時に
  保存したブランチ名と一致
- `test -z "$(git status --porcelain)"`（開始ブランチ上）— クリーン
  （作業ツリーを汚していない）

## Test plan

スパイクのため新規テストは書かない。`bun run test:all` の前後比較結果を
レポートに記録することが検証に相当する。

## Maintenance note

Next.js 16 系のマイナーアップデートで `cacheComponents` の API は変わり得る。
レポートには調査時の正確な next バージョンを必ず記載し、実装プラン化する際は
その時点のバージョンで Step 2 を再確認すること。

## STOP conditions

- インストール済み Next.js で該当フラグ/ディレクティブが利用不可
  （canary 限定等）の場合 → プロトタイプせず、その事実をレポートして no-go
  （時期尚早）で完了とする
- プロトタイプで Supabase への実接続が必要だが環境変数が未設定の場合 →
  ビルド検証のみ（`SKIP_SSG=true` の挙動を含む）に縮小し、レポートに明記
- 作業ツリーに未コミット変更が現れたまま dev に戻れない等 git 状態の混乱 →
  STOP して状態を報告（強制 reset をしない）
