/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // Tailwind v4 では PostCSS プラグインが独立パッケージに分離
    "@tailwindcss/postcss": {},
  },
};

export default config;
