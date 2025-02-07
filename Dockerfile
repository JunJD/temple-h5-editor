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
ENV MONGO_URI=${MONGO_URI:-mongodb://temple_user:123456@47.102.156.243:27017/temple-h5-editor?replicaSet=rs0&authSource=temple-h5-editor}

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

ENV NODE_ENV production
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# 复制构建产物
COPY --from=build /app/.next/standalone ./

EXPOSE 3000

# 启动应用
CMD ["node", "server.js"]
