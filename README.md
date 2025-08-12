# 概要

## 関連ソースファイル
本ドキュメントは、ラグジュアリーキャビン宿泊の予約が可能なモダンな Next.js Web アプリケーション「The Wild Oasis Cabin Booking Application」の包括的な概要を提供します。  
このシステムでは、ゲストがキャビンを閲覧・予約し、統合されたアカウント管理システムを通じて予約を管理できます。

本概要では、アプリケーションのアーキテクチャ、技術スタック、および主要機能システムについて説明します。  
各サブシステムの詳細な実装については以下を参照してください：
- **Authentication System**
- **Booking System**
- **Account Management**

---

## アプリケーションの目的
The Wild Oasis は、以下の機能を提供するキャビンホテル予約システムです。

- キャビンの閲覧とフィルタリング機能
- 日付ベースの空室確認と予約機能
- Google OAuth を用いたユーザー認証
- アカウント管理（プロフィール編集・予約管理）
- Supabase を利用したデータ永続化とストレージ連携

---

## システムアーキテクチャ概要
本アプリケーションは **Next.js 14 App Router** アーキテクチャを採用し、サーバーサイドレンダリング（SSR）と必要に応じたクライアントサイドインタラクションを組み合わせています。

## ハイレベルアーキテクチャ図
```text
 ┌─────────────────────────┐
 │        クライアント       │
 │  React + Tailwind CSS   │
 │  ─────────────────────  │
 │  ページ遷移 / UI表示      │
 └───────────┬───────────┘
             │
             ▼
 ┌─────────────────────────┐
 │      Next.js 14 App     │
 │ Server Components +     │
 │ Server Actions          │
 └───────────┬───────────┘
             │
             ▼
 ┌─────────────────────────┐
 │       Supabase          │
 │ DB (PostgreSQL)         │
 │ ファイルストレージ         │
 │ リアルタイム機能           │
 └─────────────────────────┘
```
**Sources:**
- `app/layout.js` 1-39
- `app/page.js` 1-31
- `app/_components/Header.js` 1-15

---

## 技術スタック
本アプリケーションは、パフォーマンスと開発体験を最適化したモダンな Web 開発技術を活用しています。

| カテゴリ | 技術 | 用途 |
|----------|------|------|
| フロントエンドフレームワーク | Next.js 14 | App Router, Server Components, Server Actions |
| UI ライブラリ | React 18 | コンポーネントベース UI + SSR |
| 認証 | NextAuth 5 | OAuth 連携とセッション管理 |
| データベース | Supabase | PostgreSQL + リアルタイム機能 |
| スタイリング | Tailwind CSS | ユーティリティファースト CSS |
| アイコン | Heroicons | React アイコンライブラリ |
| 日付処理 | date-fns, react-day-picker | 日付操作とカレンダー UI |
| フォント | Josefin Sans | Google Fonts 連携 |

**Sources:**
- `package.json` 12-27

---

## 主要機能領域

### 1. キャビン管理システム
- キャビン一覧：フィルタ付き SSR レンダリング
- キャビン詳細：画像ギャラリー・アメニティ表示
- 空室確認：日付ベースの空室検索

### 2. 予約システム
- 日付選択：チェックイン/チェックアウトのカレンダー UI
- 予約フォーム：ゲスト情報入力と予約作成
- 状態管理：`ReservationContext` による日付状態共有

### 3. アカウント管理
- プロフィール管理：国選択付きプロフィール編集
- 予約管理：既存予約の表示・編集・キャンセル
- 認証フロー：Google OAuth ログイン/ログアウト

---

## アプリケーションのファイル構造
本コードベースは Next.js App Router の規約に従い、機能ごとに整理されています。

**ファイル構造図**
```text
app/
 ├─ layout.js
 ├─ page.js
 ├─ _components/
 │    └─ Header.js
 ├─ cabins/
 │    ├─ page.js
 │    └─ [id].js
 ├─ account/
 │    ├─ page.js
 │    └─ reservations.js
 └─ booking/
      ├─ page.js
      └─ confirm.js
```
**Sources:**
- `app/layout.js` 15-22
- `package.json` 1-28

---

## 主な設定要素
アプリケーションのメタデータとグローバル設定はルートレイアウトで定義されています。

- **タイトルテンプレート**：`%s | The Wild Oasis`（ページタイトルの統一）
- **SEO 説明**：イタリア・ドロミテ地方のラグジュアリーキャビン市場向け
- **グローバルスタイル**：Josefin Sans フォント + Tailwind CSS ユーティリティ
- **レイアウト構造**：`Header` + メインコンテンツ + `ReservationProvider` コンテキスト

**Sources:**
- `app/layout.js` 15-22
- `app/layout.js` 24-39

---

## 外部サービス・内部モジュール連携
本システムは以下の外部サービスおよび内部モジュールと統合されています。
```text
Google OAuth  ──▶ NextAuth  ──▶ 認証管理
Supabase     ──▶ データベース操作・ファイル保存
restcountries.com ──▶ 国データ取得
ReservationContext ──▶ 予約状態管理
```
- **Supabase**：DB 操作・ファイルストレージ・リアルタイム購読
- **Google OAuth**：ユーザー認証・プロフィール取得
- **NextAuth**：セッション管理・認証ミドルウェア
- **restcountries.com**：国データ取得（プロフィール用）
- **ReservationContext**：予約フローにおけるクライアントサイド状態管理

---

このアーキテクチャにより、スケーラブルで高性能、かつ最新の開発手法とユーザー体験を備えたキャビン予約システムが実現されています。
[For more details](https://deepwiki.com/myoshi2891/MasterModernReact_NextJs/1-overview)
