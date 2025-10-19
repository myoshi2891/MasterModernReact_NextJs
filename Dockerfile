# syntax=docker/dockerfile:1.7
FROM node:20.19.0-bullseye AS dev-base

WORKDIR /app

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends gosu \
  && rm -rf /var/lib/apt/lists/*

# 依存を先に入れてキャッシュ活用
COPY package*.json ./
RUN npm ci

# 初回起動を速くするため node_modules を焼き込み
RUN cp -a node_modules /opt/node_modules.baked

# 非 root 実行ユーザ（ホーム作成）
RUN groupadd -r nodeapp --gid=1001 \
  && useradd -r -g nodeapp --uid=1001 --create-home --home-dir /home/nodeapp --shell /bin/bash nodeapp \
  && mkdir -p /home/nodeapp \
  && chown -R nodeapp:nodeapp /home/nodeapp /app /opt/node_modules.baked

ENV HOME=/home/nodeapp
ENV PORT=3000
EXPOSE 3000

# 開発用エントリポイント（権限降格＆ウォームアップ＆初回同期待ち）
COPY docker/start-dev.sh /usr/local/bin/start-dev.sh
RUN chmod +x /usr/local/bin/start-dev.sh
ENTRYPOINT ["start-dev.sh"]

# -------------------- ここから本番ビルド用 --------------------

# 依存全入れで Next をビルド（devDeps 必要）
FROM node:20.19.0-bullseye AS prod-build
WORKDIR /app

# ここでビルド時に必要な公開環境変数を受ける
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_KEY=${NEXT_PUBLIC_SUPABASE_KEY}

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 実行最小イメージ（glibc系）
FROM node:20.19.0-bullseye AS prod-runtime
WORKDIR /app

# 実行ユーザ
RUN groupadd -r nodeapp --gid=1001 \
  && useradd -r -g nodeapp --uid=1001 --create-home --home-dir /home/nodeapp --shell /bin/bash nodeapp
ENV HOME=/home/nodeapp
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# runtime に必要なものだけ
COPY --from=prod-build /app/package*.json ./
RUN npm ci --omit=dev

# Next 実行に必要なアセット
COPY --from=prod-build /app/.next ./.next
COPY --from=prod-build /app/public ./public
# 必要に応じて next.config.js / middleware.js / server.js など
COPY --from=prod-build /app/next.config.js* ./ 2>/dev/null || true/

# 権限
RUN chown -R nodeapp:nodeapp /app
USER nodeapp

# next start
CMD ["npm","run","start","--","-H","0.0.0.0","-p","3000"]
