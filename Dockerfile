# 构建阶段
FROM node:20.13.1 build
WORKDIR /app

# 安装必要的系统依赖
RUN apk add --no-cache libc6-compat openssl

# 安装 pnpm
RUN npm install -g pnpm

# 首先复制 package.json 相关文件以利用缓存
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# 安装依赖
RUN node -v
RUN pnpm install

# 设置构建时的环境变量
ARG MONGO_URI
ENV MONGO_URI=${MONGO_URI:-mongodb://localhost:27017/temple-h5-editor}

# 生成 Prisma Client
RUN pnpm prisma generate

# 复制源代码
COPY . .

# 构建应用
RUN pnpm build

# 生产阶段
FROM node:20.13.1 AS runner
WORKDIR /app

# 安装必要的系统依赖
RUN apk add --no-cache libc6-compat openssl

ENV NODE_ENV production

# 复制构建产物和必要文件
COPY --from=build /app/next.config.js ./
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

# 设置环境变量
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

EXPOSE 3000

# 启动应用
CMD ["node", "server.js"] 