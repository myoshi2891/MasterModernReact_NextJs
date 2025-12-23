# プロジェクト憲法

この文書はチーム合意で更新する「プロジェクト憲法」です。
品質基準と非機能要件を明確にし、判断に迷ったときの拠り所にします。

> 更新履歴: 2025-12-24 初版策定

## 品質基準

### コード品質
- ESLint: `eslint-config-next` の標準ルールに準拠
- Prettier: 未導入 (将来的に検討)
- TypeScript: 段階的移行予定 (`typescript-migration-plan.md` 参照)

### テスト基準
- ユニットテスト: `tests/unit/` - ビジネスロジックをカバー
- コンポーネントテスト: `tests/component/` - UIコンポーネントの振る舞い
- E2Eテスト: `tests/e2e/` - クリティカルパスの検証
- CI: Node 20/22 マトリクスで検証

### レビュー基準
- 仕様逸脱の有無
- セキュリティリスク (認証・認可・入力検証)
- パフォーマンス影響
- テストの有無

## 非機能要件

### パフォーマンス
- ISR (Incremental Static Regeneration): キャビン一覧は3600秒
- 画像最適化: Next.js Image コンポーネント使用
- フォント: ローカルフォント (`app/fonts/`) で配信

### 可用性
- ヘルスチェック: `/api/health` エンドポイント
- エラーバウンダリ: `app/error.jsx` で全体キャッチ
- Not Found: `app/not-found.jsx` でカスタム404

### アクセシビリティ
- ボタン: `type` 属性を明示
- ナビゲーション: `aria-controls` を設定
- 画像: `alt` 属性必須

### 観測性
- ログ: `console.error` でエラー記録 (将来的に構造化ログ検討)
- Supabase: エラー時にスローして上位で処理

## セキュリティ

### 認証/認可
- NextAuth.js 4.x (JWT セッション)
- Google OAuth のみ対応
- Middleware (`/account/*`) で保護

### 秘密情報
- 環境変数: `.env.local` (Git管理外)
- サービスロールキー: サーバー専用クライアントのみ使用
- `NEXT_PUBLIC_*`: 公開可能なキーのみ

### RLS (Row Level Security)
- Supabase側でRLS設定済み
- サーバークライアントはRLSバイパス (`SUPABASE_SERVICE_ROLE_KEY`)
- Server Actionsで `guestId` 検証必須

### 入力検証
- `validateBookingInput()`: 予約データの包括的検証
- `normalizeNationalId()`: 国民ID の正規化
- observations: 1000文字制限

## レビュー観点

1. **仕様逸脱**: 要件と実装の乖離
2. **回帰リスク**: 既存機能への影響
3. **データ整合性**: Supabase操作の正確性
4. **エラーハンドリング**: 例外時のユーザー体験
5. **認可チェック**: `guestId` の検証漏れ

## スコープ

### In-scope
- キャビン予約システム (一覧/詳細/予約/編集/削除)
- ゲストプロフィール管理
- Google OAuth 認証
- レスポンシブUI

### Out-of-scope
- 管理者ダッシュボード (別システム想定)
- 決済機能 (isPaid フラグのみ)
- 多言語対応
- プッシュ通知

## 技術的負債

- [ ] TypeScript 移行 (`typescript-migration-plan.md`)
- [ ] npm → Bun 移行 (`npm-to-bun-migration-plan.md`)
- [ ] 構造化ログの導入
- [ ] Prettier 導入
