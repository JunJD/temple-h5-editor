# 构建阶段
FROM node:20-slim AS build
WORKDIR /app

# 安装 OpenSSL
RUN apt-get update -y && apt-get install -y openssl

# 安装 pnpm
RUN npm install -g pnpm@8.15.4

# 复制项目文件
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# 安装依赖
RUN pnpm install

# 设置构建时的环境变量
ARG MONGO_URI
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL
ARG GOOGLE_APP_CLIENT_ID
ARG GOOGLE_APP_CLIENT_SECRET

ENV MONGO_URI=${MONGO_URI}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}
ENV GOOGLE_APP_CLIENT_ID=${GOOGLE_APP_CLIENT_ID}
ENV GOOGLE_APP_CLIENT_SECRET=${GOOGLE_APP_CLIENT_SECRET}

# 复制源代码并构建
COPY . .
RUN pnpm prisma generate
RUN pnpm run build

# 优化构建产物
RUN cp -r public .next/standalone/ && \
    cp -r .next/static .next/standalone/.next/

# 生产阶段
FROM node:20-slim AS runner
WORKDIR /app

# 安装 OpenSSL
RUN apt-get update -y && apt-get install -y openssl

# 设置运行时环境变量
ARG MONGO_URI
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL
ARG GOOGLE_APP_CLIENT_ID
ARG GOOGLE_APP_CLIENT_SECRET

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV MONGO_URI=${MONGO_URI}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}
ENV GOOGLE_APP_CLIENT_ID=${GOOGLE_APP_CLIENT_ID}
ENV GOOGLE_APP_CLIENT_SECRET=${GOOGLE_APP_CLIENT_SECRET}

# 复制构建产物
COPY --from=build /app/.next/standalone ./

EXPOSE 3000

# 启动应用
CMD ["node", "server.js"]
