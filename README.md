### Next.js 项目模板

一个使用 Shadcn、Prisma ORM、MongoDB 和 Next Auth 的 Next.js 应用

[![使用 Vercel 部署](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdanybeltran%2Fnextjs-typescript-and-mongodb)

### 更新依赖

要更新所有依赖到最新版本，请运行：

```
./scripts/update-deps.sh
```

---

### 开发环境配置

你需要设置 MongoDB 连接字符串以及 `next-auth` 所需的环境变量：

```
MONGO_URI=
NEXTAUTH_SECRET=
GOOGLE_APP_CLIENT_ID=
GOOGLE_APP_CLIENT_SECRET=
NEXTAUTH_URL=http://localhost:3000
```

（如果你部署在 Vercel 上，则不需要 `NEXTAUTH_URL`）

如何获取这些变量？

---

- [`MONGO_URI`](https://www.mongodb.com/docs/manual/reference/connection-string/)

连接字符串格式如下：

`mongodb+srv://<用户名>:<密码>@cluster0.<组织>.mongodb.net/<数据库名>?retryWrites=true&w=majority`

在你的集群中，点击 **Connect**：

![示例图片](docs/connect-1.png)

在 **Connect your application** 部分，点击 **Drivers**：

![示例图片](docs/drivers.png)

点击连接字符串旁边的复制按钮：

![示例图片](docs/connection-string.png)

将 `<password>` 替换为你的用户密码。确保所有参数都经过 [URL 编码](https://dochub.mongodb.org/core/atlas-url-encoding)。

---

- [`GOOGLE_APP_CLIENT_ID` 和 `GOOGLE_APP_CLIENT_SECRET`](https://developers.google.com/identity/oauth2/web/guides/get-google-api-clientid)

---

使用你喜欢的工具生成 `NEXTAUTH_SECRET` 哈希值：

使用[这个工具](https://generate-secret.vercel.app/32)是最快的方式。你可以通过修改 URL 最后的数字来生成不同长度的哈希值，例如 `https://generate-secret.vercel.app/44`

**OpenSSL 方式：**

```bash
openssl rand -base64 32
```

**Urandom 方式：**

```bash
head -c 32 /dev/urandom | base64
```

**Python 方式：**

```python
import base64
import os

random_bytes = os.urandom(32)
base64_string = base64.b64encode(random_bytes).decode('utf-8')
print(base64_string)
```

**JavaScript 方式：**

```javascript
const crypto = require('crypto')

const randomBytes = crypto.randomBytes(32)
const base64String = randomBytes.toString('base64')
console.log(base64String)
```

你可以将这些变量添加到 `.ENV` 文件中（别忘了将它添加到 `.gitignore` 文件中！）

相关文档：

- [`nextjs`](https://nextjs.org/docs)

- [`next-auth`](https://next-auth.js.org/getting-started/introduction)

- [`http-react`](https://httpr.vercel.app/docs)

[在线预览](https://nextjs-typescript-and-mongodb-psi.vercel.app)

### 常见问题排查

#### Google 登录超时问题

如果遇到 Google 登录时出现 "outgoing request timed out after 3500ms" 错误，可以尝试以下解决方案：

1. 检查网络连接
   - 确保你的网络可以正常访问 Google 服务
   - 如果使用代理，请确保代理配置正确

2. 验证 Google OAuth 配置
   - 确保 `GOOGLE_APP_CLIENT_ID` 和 `GOOGLE_APP_CLIENT_SECRET` 配置正确
   - 检查 Google Cloud Console 中的 OAuth 2.0 客户端配置：
     - 已添加正确的授权重定向 URI（例如：`http://localhost:3000/api/auth/callback/google`）
     - 确保 API 和服务已启用

3. 调整超时设置
   在 `src/app/api/auth/[...nextauth]/route.ts` 中添加超时配置：

```typescript
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_APP_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_APP_CLIENT_SECRET!,
      httpOptions: {
        timeout: 10000, // 增加超时时间到 10 秒
      },
    }),
  ],
  // ... 其他配置
};
```

如果问题仍然存在，请确保：
- 检查 Google Cloud Console 中的项目状态是否正常
- 确认你的应用是否在支持的区域运行
- 查看 Google OAuth 服务的状态页面是否有服务中断

### 查看 Google OAuth 凭据

1. 登录 [Google Cloud Console](https://console.cloud.google.com/)

2. 在左侧菜单中选择 **APIs & Services** > **Credentials**（凭据）

3. 在凭据页面，你可以看到所有已创建的 OAuth 2.0 客户端 ID：
   - 查找类型为 "OAuth 2.0 Client IDs" 的条目
   - 点击相应的客户端名称可以查看详细信息
   - 在详情页面可以看到 Client ID 和 Client Secret

如果需要创建新的凭据：

1. 点击页面顶部的 **+ CREATE CREDENTIALS**（创建凭据）
2. 选择 **OAuth client ID**（OAuth 客户端 ID）
3. 选择应用类型（通常选择 "Web application"）
4. 填写必要信息：
   - 名称：为你的应用取一个名字
   - 授权重定向 URI：添加你的回调地址
     - 开发环境：`http://localhost:3000/api/auth/callback/google`
     - 生产环境：`https://你的域名/api/auth/callback/google`

5. 创建后会得到新的 Client ID 和 Client Secret

## Prisma 命令说明

- `prisma:generate`: 生成 Prisma Client
- `prisma:push`: 将 schema 变更推送到数据库
- `prisma:reset`: 重置数据库（警告：会清空所有数据）
- `prisma:studio`: 启动 Prisma Studio 可视化界面

## 故障排除

### MongoDB 副本集错误

如果遇到以下错误：

```
Prisma needs to perform transactions, which requires your MongoDB server to be run as a replica set.
```

解决步骤：
1. 确保 MongoDB 以副本集模式运行
2. 检查连接字符串中是否包含 `replicaSet=rs0`
3. 验证副本集状态：
```

## MongoDB 副本集配置

如果使用 Prisma 时遇到以下错误：
```
Prisma needs to perform transactions, which requires your MongoDB server to be run as a replica set.
```

需要配置 MongoDB 副本集。以下是详细步骤：

### 1. 创建必要的目录和配置文件

```bash
# 创建数据和日志目录
mkdir -p ~/mongodb/data
mkdir -p ~/mongodb/log

# 创建配置文件
echo 'systemLog:
  destination: file
  path: /Users/你的用户名/mongodb/log/mongod.log
  logAppend: true
storage:
  dbPath: /Users/你的用户名/mongodb/data
net:
  bindIp: 127.0.0.1
  port: 27017
replication:
  replSetName: rs0' > ~/mongodb/mongod.conf
```

### 2. 设置正确的权限

```bash
chmod 755 ~/mongodb
chmod 755 ~/mongodb/data
chmod 755 ~/mongodb/log
chmod 644 ~/mongodb/mongod.conf
```

### 3. 启动 MongoDB 副本集

```bash
# 确保没有其他 MongoDB 实例在运行
pkill mongod

# 使用配置文件启动 MongoDB
mongod --config ~/mongodb/mongod.conf --fork
```

### 4. 初始化副本集

```bash
# 连接到 MongoDB
mongosh

# 在 mongosh shell 中执行：
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "127.0.0.1:27017" }
  ]
})

# 检查副本集状态
rs.status()
```

### 5. 更新环境变量

确保你的 `.env` 文件中的 MongoDB 连接字符串包含副本集参数：

```
MONGO_URI=mongodb://127.0.0.1:27017/你的数据库名?replicaSet=rs0
```

### 常见问题

1. **MongoDB 无法启动**
   - 检查日志文件：`tail -f ~/mongodb/log/mongod.log`
   - 确保端口 27017 未被占用：`lsof -i :27017`
   - 验证目录权限是否正确

2. **副本集初始化失败**
   - 确保 MongoDB 已成功启动
   - 检查网络连接是否正常
   - 验证配置文件中的 `replSetName` 设置

3. **Prisma 连接错误**
   - 确保连接字符串中包含 `replicaSet=rs0`
   - 验证副本集状态：`rs.status()`
   - 检查数据库用户权限