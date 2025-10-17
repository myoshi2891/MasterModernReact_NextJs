FROM node:20.19.0-bullseye

WORKDIR /app

# Install dependencies with cache leverage
RUN apt-get update -y && apt-get install -y --no-install-recommends gosu && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci

# Copy the rest of the application source
COPY . .

# Create non-root user and set proper permissions
RUN groupadd -r nodeapp --gid=1001 && \
    useradd -r -g nodeapp --uid=1001 --shell /bin/bash nodeapp && \
    chown -R nodeapp:nodeapp /app

EXPOSE 3000

COPY docker/start-dev.sh /usr/local/bin/start-dev.sh
RUN chmod +x /usr/local/bin/start-dev.sh

ENTRYPOINT ["start-dev.sh"]
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]
