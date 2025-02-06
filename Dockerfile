# 构建阶段
FROM centos:7 AS build
WORKDIR /app

# 安装基础依赖
RUN yum update -y && yum install -y \
    curl \
    git \
    make \
    gcc-c++ \
    && yum clean all

# 安装 nvm
ENV NVM_DIR /root/.nvm
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash \
    && . $NVM_DIR/nvm.sh \
    && nvm install 20.13.1 \
    && nvm use 20.13.1 \
    && nvm alias default 20.13.1

# 添加 node 和 npm 到环境变量
ENV PATH $NVM_DIR/versions/node/v20.13.1/bin:$PATH

# 安装 pnpm
RUN npm install -g pnpm@8.15.4

# 复制项目文件
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# 安装依赖
RUN pnpm install --verbose

# 设置构建时的环境变量
ARG MONGO_URI
ENV MONGO_URI=${MONGO_URI:-mongodb://temple_user:123456@47.102.156.243:27017/temple-h5-editor?replicaSet=rs0&authSource=temple-h5-editor}

# 复制源代码并构建
COPY . .
RUN pnpm prisma generate
RUN pnpm build

# 生产阶段
FROM centos:7 AS runner
WORKDIR /app

# 安装基础依赖
RUN yum update -y && yum install -y \
    curl \
    && yum clean all

# 安装 nvm 和 Node.js
ENV NVM_DIR /root/.nvm
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash \
    && . $NVM_DIR/nvm.sh \
    && nvm install 20.13.1 \
    && nvm use 20.13.1 \
    && nvm alias default 20.13.1

# 添加 node 到环境变量
ENV PATH $NVM_DIR/versions/node/v20.13.1/bin:$PATH
ENV NODE_ENV production

# 复制构建产物
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/node_modules/.prisma/client ./node_modules/.prisma/client

# 设置环境变量
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

EXPOSE 3000

# 启动应用
CMD ["node", "server.js"]