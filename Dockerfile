FROM node:20.19.0-bullseye

WORKDIR /app

# Install dependencies with cache leverage
RUN apt-get update -y && apt-get install -y --no-install-recommends gosu=1.14-* && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci

# Copy the rest of the application source
COPY . .

# Create non-root user and set proper permissions
RUN groupadd -r nodeapp --gid=1001 && \
    useradd -r -g nodeapp --uid=1001 --shell /bin/bash nodeapp && \
    chown -R nodeapp:nodeapp /app

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1));"

COPY docker/start-dev.sh /usr/local/bin/start-dev.sh
RUN chmod +x /usr/local/bin/start-dev.sh

ENTRYPOINT ["/usr/local/bin/start-dev.sh"]
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]
