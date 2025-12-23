# PR 提出ワークフロー

## 1. ブランチ命名
- feat/<short>
- fix/<short>
- chore/<short>
- docs/<short>

## 2. 変更点まとめ
- 目的/背景
- 影響範囲（機能・画面・API）
- 仕様リンク（`specs/NNN-...`）

## 3. テスト
```bash
# ユニットテスト
npm run test:unit

# コンポーネントテスト
npm run test:component

# E2Eテスト
npm run test:e2e
```
- 実行結果（成功/失敗/未実施理由）を明記

## 4. チェックリスト
- [ ] 仕様と差分が一致している
- [ ] 破壊的変更がある場合は移行手順を記載
- [ ] テスト結果を添付
- [ ] ドキュメント更新が必要なら実施
- [ ] TODO と未完タスクを明記
