# Kilo Code / Spec Kit 導入メモ

このリポジトリには Kilo Code と Spec Kit の最小構成を追加しています。
既存コードには影響しない導入です。

## どこに何があるか
- `.kilocode/`: 常時適用するルールとワークフロー
- `.specify/`: 憲法・テンプレート・スクリプト
- `specs/`: 機能ごとの spec / plan / tasks

## 運用ルール（最小）
- 新規機能は `specs/NNN-<feature-name>/` を作成し、spec/plan/tasks を追加
- `rules` は最小限に保ち、重複や過剰な制約を避ける
- `templates` は必要に応じて更新し、変更はチーム合意で行う

## 補足
- TODO: プロジェクト固有の運用や命名ルールを追記
