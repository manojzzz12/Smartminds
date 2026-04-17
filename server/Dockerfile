FROM node:22-alpine AS base
WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json ./server/package.json
RUN npm ci --omit=dev --workspace server

COPY server ./server

WORKDIR /app/server
ENV NODE_ENV=production
EXPOSE 5001

CMD ["node", "src/server.js"]
