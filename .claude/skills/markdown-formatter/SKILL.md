---
name: markdown-formatter
description: >
  Comprehensive guide and rules for formatting Markdown files to comply with the project's `.markdownlint.json` configuration.
  Addresses common errors like MD031, MD012, and MD047.
  Trigger: Markdownリント, markdownlint, markdown formatting, MD031, MD012, MD047, blanks-around-fences.
---

# Markdown Formatting & Linting Guide

## Goal

This skill provides rules and best practices to ensure all Markdown documents (`.md` files) in this repository comply with the project's `.markdownlint.json` rules, preventing CI/CD build breakages due to markdown lint errors.

<!-- markdownlint-disable MD031 MD022 MD032 -->

## このプロジェクトの .markdownlint.json 設定概要

`.markdownlint.json` でプロジェクト固有に有効・無効化されているルールの主要項目：

| ルール | 設定 | 意味 |
|---|---|---|
| `MD022` | `false` | 見出し前後の空行は**不要**（チェックしない） |
| `MD031` | `true` | コードフェンス前後の空行は**必須** ✅ |
| `MD032` | `false` | リスト前後の空行は**不要**（チェックしない） |
| `MD012` | `true` | 連続する空行は**禁止** ✅ |
| `MD047` | （default: true）| ファイル末尾の改行は**必須** ✅ |
| `MD033` | `allowed_elements` あり | 特定の HTML タグは**許可** |

> [!IMPORTANT]
> このプロジェクトでは MD022（見出し前後の空行）と MD032（リスト前後の空行）は **無効化** されています。
> **チェック・修正が必要なのは主に MD031 / MD012 / MD047** です。

## 頻発する Markdown Lint エラーと修正パターン

### 1. MD031: blanks-around-fences（コードブロック前後の空行）

**問題**: ` ``` ` で囲まれたコードブロックの直前または直後に空行（改行）がない。特にリストの直下にネストされているコードブロックで多発します。

#### ❌ 違反例

```markdown
- **tests/unit/LanguageContext.test.tsx**:
  - `LanguageProvider` の初期値を検証します。
  ```typescript
  expect(screen.getByText("Language")).toBeInTheDocument();
  ```
```

#### ✅ 修正例

リストのネスト内であっても、コードブロックの前後に**インデントされた空行**を挿入します。

```markdown
- **web-next/tests/lib/navigation.test.ts**:
  - `NAV_ITEMS` の総数を検証します。

  ```typescript
  expect(NAV_ITEMS).toHaveLength(25);
  ```
```

---

### 2. MD012: no-multiple-blanks（連続した空行）

**問題**: 2行以上の連続した空行が記述されている。

#### ❌ 違反例

```markdown
パラグラフ1


パラグラフ2（空行が2行以上挟まれている）
```

#### ✅ 修正例

空行は常に「最大1行」としてください。

```markdown
パラグラフ1

パラグラフ2
```

---

### 3. MD047: single-trailing-newline（ファイル末尾の改行）

**問題**: ファイルの最終行の末尾に改行文字（LF）がない。

#### ❌ 違反例

```markdown
...最後の行の文章（ファイルの末尾に改行がない状態）[EOF]
```

#### ✅ 修正例

ファイルの最後は必ず1行の空行（改行で終わる状態）にしてください。

```markdown
...最後の行 of the text
[EOF]
```

---

### 4. MD033: no-inline-html（インラインHTMLの制限）

**問題**: Markdown 内に許可されていない HTML タグが直接書かれている。

* **許可されている HTML 要素**: `h1`, `h2`, `p`, `i`, `footer`, `br`, `div`, `sub`, `sup`, `kbd`, `details`, `summary`
* **代替案**: 可能な限り標準の Markdown 記法を使用してください。

---

<!-- markdownlint-enable MD031 MD022 MD032 -->

## ワークフロー（検証と修正の手順）

AI エージェントは Markdown ファイルを新規作成・修正した際、コミットする前に必ず以下の手順を実行しなければなりません。

### Step 1: 自動整形スクリプトの実行（初期修正）

プロジェクトに用意されている自動フォーマットスクリプトを実行し、連続空行の除去・ファイル末尾改行の正規化を自動修正します。

```bash
bun scripts/format-markdown.mjs <file_path>
```

スクリプトが対応している自動修正内容：

* 連結リンクの分離（`)[` と `\n[` の間に改行を挿入）
* 見出し前の空行挿入（MD022 補助）
* 連続空行の折り畳み（MD012）
* ファイル末尾の改行正規化（MD047）
* YAML フロントマターおよびコードフェンス内は**変更しない**

> [!CAUTION]
> **手動優先ルール**: 自動整形スクリプトは便利ですが、リスト内のネストされたコードブロックなど複雑な構造で意図しない崩れを起こす可能性があります。自動整形を実行した後は、必ず `git diff` で意図しない変更が加えられていないかを確認し、必要に応じて手動で微調整を行ってください。

### Step 2: Linter による検証

次に、プロジェクトの `.markdownlint.json` に従って Linter を実行し、残存するエラーがないかを確認します。

```bash
# Bun を使用して markdownlint-cli を実行
bun x markdownlint-cli <file_path>
```

エラーが出力されなくなるまで、手動でマークダウンを修正します。

### Step 3: PII の機械的検証

変更したファイルを Git にステージング（`git add`）した後、リポジトリのセキュリティ規則に基づき、絶対パスや PII が含まれていないか必ず検証します。

```bash
git diff --cached | grep -E '^\+[^+]' | grep -E '(/Users/|/home/|C:\\Users\\)' | grep -vE 'johndoe'
```

検証が成功（何も検出されない）したことを確認してから、コミットを適用してください。
