# 409 Conflict エラー運用ガイドライン

> 作成日: 2026-01-01
> 関連仕様: [spec.md](spec.md)

## 概要

予約システムでは、同一キャビン・同一日程への重複予約を防ぐためDB制約（EXCLUDE制約）を使用している。この制約により、競合する予約リクエストは **409 Conflict** エラーで拒否される。

本ドキュメントでは、409エラーが連続発生した場合の判断基準と対応手順を定義する。

## 409エラーの発生パターン

### 正常なケース（混雑）

| パターン | 説明 | 例 |
|---------|------|-----|
| 人気日程への集中 | 特定の日程に複数ユーザーが同時予約 | 年末年始、GW、夏休み |
| セール/キャンペーン | 予約開始時刻に集中アクセス | 早割開始、限定プラン公開 |
| キャンセル待ち競合 | キャンセル発生直後の再予約競争 | 人気キャビンのキャンセル |

### 異常なケース（システム問題）

| パターン | 説明 | 兆候 |
|---------|------|------|
| リトライ暴走 | クライアント側のリトライロジック異常 | 同一ユーザーから短時間に大量の409 |
| ボット/スクレイピング | 自動化ツールによる大量予約試行 | 異常なリクエストパターン |
| 状態不整合 | キャッシュとDBの不整合 | 空き表示なのに予約不可が続く |
| バグ | 予約ロジックの不具合 | 特定条件で必ず409になる |

## 判断基準

### メトリクス定義

| メトリクス | 計算方法 | 正常範囲 |
|-----------|---------|---------|
| 409発生率 | 409件数 / 全予約リクエスト数 | < 5% |
| 409/分 | 1分間の409件数 | < 10件 |
| ユーザー別409率 | 同一ユーザーの409件数 / 予約試行数 | < 30% |
| キャビン別409率 | 同一キャビンの409件数 / 予約試行数 | < 20% |

### 閾値とアラートレベル

| レベル | 条件 | 対応 |
|-------|------|------|
| INFO | 409発生率 1-5% | ログ記録のみ |
| WARNING | 409発生率 5-10% or 409/分 > 10 | 監視強化 |
| ERROR | 409発生率 > 10% or 409/分 > 30 | 調査開始 |
| CRITICAL | 409発生率 > 20% or 同一ユーザー10分間5回以上 | 即時対応 |

## 監視項目

### ログ出力フォーマット

```json
{
  "timestamp": "2026-01-01T12:00:00.000Z",
  "level": "warn",
  "event": "BOOKING_CONFLICT",
  "hashedUserId": "sha256:a1b2c3...",
  "cabinId": 123,
  "startDate": "2026-01-15",
  "endDate": "2026-01-18",
  "requestId": "req_abc123",
  "responseTimeMs": 45,
  "cabinAvailability": "appeared_available",
  "errorDetail": "23P01:bookings_no_overlap"
}
```

### PII方針

| フィールド | 記録可否 | 理由 |
|-----------|---------|------|
| guestId | ❌ | 直接的なユーザー識別子 |
| email | ❌ | PII |
| 氏名 | ❌ | PII |
| hashedUserId | ✅ | 一方向ハッシュ（SHA-256）のため逆変換不可、相関分析のみ可能 |
| cabinId | ✅ | システム内部ID |
| requestId | ✅ | リクエスト追跡用 |
| responseTimeMs | ✅ | レスポンス時間（遅延がコンフリクトに寄与しているか判断） |
| cabinAvailability | ✅ | リクエスト前のキャビン表示状態（キャッシュ不整合検出用） |
| errorDetail | ✅ | SQLSTATE:制約名（DBエラーとアプリバグの切り分け用） |

**hashedUserIdの生成例**:
```typescript
import { createHash } from "crypto";

function hashUserId(guestId: number): string {
  return `sha256:${createHash("sha256")
    .update(`${guestId}:${process.env.HASH_SALT}`)
    .digest("hex")
    .substring(0, 16)}`;
}
```

**注意**: `HASH_SALT`は環境変数で管理し、ソースコードにハードコードしないこと

### ダッシュボード推奨項目

1. **リアルタイム**
   - 409発生件数/分（時系列グラフ）
   - キャビン別409発生マップ

2. **日次集計**
   - 409発生率の推移
   - 上位10キャビンの409件数
   - 時間帯別分布

3. **週次分析**
   - 409パターンの変化
   - 異常検出アラート履歴

## 対応手順

### Level: WARNING

1. ダッシュボードで発生パターンを確認
2. 特定キャビン/日程に集中しているか確認
3. 人気日程への集中であれば経過観察
4. 異常パターンの場合は ERROR 対応へ

### Level: ERROR

1. ログから発生パターンを分析
   ```bash
   # 直近1時間の409をキャビン別に集計
   grep "BOOKING_CONFLICT" app.log | jq -r '.cabinId' | sort | uniq -c | sort -rn

   # 直近1時間の409をユーザー別に集計（hashedUserIdで相関）
   grep "BOOKING_CONFLICT" app.log | jq -r '.hashedUserId' | sort | uniq -c | sort -rn | head -20

   # キャッシュ不整合の検出（appeared_availableなのに409）
   grep "BOOKING_CONFLICT" app.log | jq 'select(.cabinAvailability == "appeared_available")' | wc -l

   # レスポンス遅延の確認（100ms以上は遅延）
   grep "BOOKING_CONFLICT" app.log | jq 'select(.responseTimeMs > 100) | .responseTimeMs' | sort -rn | head -10

   # エラー種別の集計（DBエラー vs アプリエラー）
   grep "BOOKING_CONFLICT" app.log | jq -r '.errorDetail' | sort | uniq -c | sort -rn
   ```

2. 以下を確認:
   - 同一hashedUserIdからの連続リクエストはないか（5回以上は異常）
   - 特定のキャビン/日程に集中していないか
   - `cabinAvailability == "appeared_available"` が多い場合はキャッシュ不整合
   - `responseTimeMs` が高い場合はDB負荷を確認
   - `errorDetail` が想定外の場合はアプリバグの可能性

3. 原因特定後:
   - 混雑: 経過観察、必要に応じてキャッシュTTL調整
   - システム異常: CRITICAL対応へ

### Level: CRITICAL

1. **即時対応**
   - 開発チームへエスカレーション
   - 異常リクエスト元のIPをブロック（ボット疑い時）

2. **調査項目**
   - クライアント側リトライロジックの確認
   - 直近のデプロイ履歴確認
   - DB接続プール・レスポンスタイム確認

3. **暫定対応オプション**
   - レート制限の一時的強化
   - 該当キャビンの一時停止
   - 予約機能のメンテナンスモード

## 混雑 vs システム異常の見分け方

### 混雑の特徴

- ✅ 特定の人気日程に集中
- ✅ 複数の異なるユーザーから発生
- ✅ 時間とともに自然に収束
- ✅ 成功する予約も一定数ある

### システム異常の特徴

- ⚠️ 同一hashedUserIdから短時間に複数回（10分間5回以上）
- ⚠️ 特定条件で100%失敗
- ⚠️ 時間が経っても収束しない
- ⚠️ 空き表示と実際の状態が乖離

## 予防策

### 実装済み

- [x] DB制約による重複防止（EXCLUDE制約）
- [x] エラーコードの適切なマッピング（errors.ts）
- [x] ユーザーフレンドリーなエラーメッセージ

### 推奨（将来対応）

- [ ] クライアント側での楽観的ロック表示
- [ ] 予約前の空き状況リアルタイム更新（WebSocket）
- [ ] idempotency keyによる二重送信防止
- [ ] レート制限の導入（1ユーザー/分 N回）

## 関連ドキュメント

- [spec.md](spec.md) - 予約同時実行対策の仕様
- [tasks.md](tasks.md) - タスク進捗
- [app/_lib/errors.ts](../../app/_lib/errors.ts) - エラーマッピング実装
