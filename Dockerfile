# 构建阶段
FROM node:20.13.1-alpine AS builder
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN pnpm install

COPY . .
RUN pnpm build

# 运行阶段
FROM node:20.13.1-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"] 