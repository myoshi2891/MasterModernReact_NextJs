# Claude Code ガイドライン

Owner: AI Assistant
Last updated: 2025-12-24

## 目的

Claude Code がこのプロジェクトで開発支援を行う際の指針を定義します。

## メモリバンク参照順序

1. `CLAUDE.md` - プロジェクト概要・クイックスタート
2. `.specify/memory/constitution.md` - 品質基準・非機能要件
3. `.specify/memory/architecture.md` - アーキテクチャ設計
4. `.specify/memory/tech-stack.md` - 技術スタック詳細
5. `specs/index.md` - 仕様書インデックス
6. `docs/progress.md` - 進捗ログ

## コード変更時の確認事項

### 必須チェック

- [ ] 既存のコード規約に準拠しているか
- [ ] Server Actions は `guestId` の検証を行っているか
- [ ] Supabaseクライアントは適切に選択されているか (Server/Browser)
- [ ] 入力値のバリデーションは十分か
- [ ] エラーハンドリングは適切か

### テスト

- [ ] ユニットテスト: `npm run test:unit`
- [ ] コンポーネントテスト: `npm run test:component`
- [ ] 影響範囲が広い場合: `npm run test:all`

### ドキュメント

- [ ] 仕様変更時は `specs/` を更新
- [ ] 完了時は `docs/progress.md` に記録

## ファイル構成ルール

### コンポーネント追加

```
app/_components/NewComponent.jsx  # 共通コンポーネント
app/feature/_components/Local.jsx # 機能固有コンポーネント (非推奨)
```

### ユーティリティ追加

```
app/_lib/new-util.js  # 新規ユーティリティ
```

### 仕様書追加

```
specs/NNN-feature-name/
├── spec.md
├── plan.md
└── tasks.md
```

## 禁止事項

1. **秘密情報のハードコード**: 環境変数を使用すること
2. **ブラウザからの service-role 使用**: `supabaseServer` はサーバー専用
3. **認可チェックの省略**: `/account/*` の操作は `guestId` 検証必須
4. **テストなしのマージ**: 最低限のテスト実行を確認

## 推奨パターン

### データ取得

```javascript
// Good: data-service.js の関数を使用
import { getCabins } from "@/app/_lib/data-service";
const cabins = await getCabins();

// Bad: コンポーネント内で直接クエリ
const { data } = await supabase.from("cabins").select("*");
```

### Server Actions

```javascript
// Good: 認可チェック付き
export async function updateBooking(formData) {
  const session = await auth();
  if (!session?.user?.guestId) {
    throw new Error("認証が必要です");
  }
  // ...
}
```

### エラーハンドリング

```javascript
// Good: ユーザー向けメッセージ
throw new Error("予約の更新に失敗しました");

// Bad: 技術的詳細を露出
throw new Error(`DB Error: ${error.code} - ${error.details}`);
```

## コミットメッセージ

```
<type>: <summary>

<body (optional)>

Types: feat, fix, docs, style, refactor, test, chore
```

例:
- `feat: add cabin search filter`
- `fix: resolve booking date validation`
- `docs: update architecture diagram`