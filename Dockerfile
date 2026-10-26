# Multi-stage Dockerfile for Sarvam Voice Engine
FROM node:24-alpine AS builder

WORKDIR /app

# Install client dependencies and build static assets
COPY client/package*.json ./client/
RUN cd client && npm install

COPY client ./client
RUN cd client && npm run build

# Production Server Stage
FROM node:24-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV IS_DOCKER=1

COPY package*.json ./
RUN npm install --omit=dev

COPY server ./server
COPY --from=builder /app/client/dist ./client/dist

# Persistent data directory for embedded SQLite database
RUN mkdir -p /app/data && chown -R node:node /app/data

USER node

EXPOSE 8080 3000 3001

CMD ["node", "server/server.js"]