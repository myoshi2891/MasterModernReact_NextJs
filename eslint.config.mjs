// ESLint 10 Flat Config。
// Next.js 16 で `next lint` が削除されたため ESLint を直接実行する。
// eslint-config-next/core-web-vitals は v16 で flat config 配列を提供する。
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  {
    // ビルド/テスト成果物は lint 対象外
    ignores: [
      ".next/**",
      "node_modules/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "next-env.d.ts",
    ],
  },
  ...nextCoreWebVitals,
  {
    // eslint-plugin-react の React バージョン自動検出は ESLint 10 で
    // 削除された context API（getFilename）に依存しクラッシュするため、
    // バージョンを明示して検出をスキップする。
    settings: {
      react: {
        version: "19.2",
      },
    },
  },
];

export default eslintConfig;
