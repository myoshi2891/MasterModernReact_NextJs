// CSS の side-effect import（例: import "@/app/_styles/globals.css"）に対する
// アンビエント型宣言。TypeScript 6 では型宣言のない side-effect import が
// TS2882 エラーになるため、グローバル/モジュール CSS のスタブを提供する。
// 実体のバンドルは Next.js（Turbopack/PostCSS）が担当する。
declare module "*.css";

declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
