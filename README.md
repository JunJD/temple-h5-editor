### Next.js 低代码平台

一个基于 Next.js + GrapesJS 的低代码平台,用于生成 H5 活动页面。集成了 Shadcn、Prisma ORM、MongoDB 和 Next Auth。

 ### 相关文档

- [GrapesJS](https://grapesjs.com/docs/)
- [Next.js](https://nextjs.org/docs)
- [NextAuth](https://next-auth.js.org/getting-started/introduction)
- [MongoDB](https://www.mongodb.com/docs)
- [测试问题记录](docs/TESTING.md)


### 代办

- [x] Tab [block]
- [x] selector [trait]
- [x] formate order list [block]
- [x] linkage form [block]
- [ ] 订单、微信支付能力
- [ ] 保存为block、模板、issue能力
- [x] 被表达式影响的组件，每次change的时候 需要更新值到form data
- [x] 切换option的时候 traits的值 需要切换

### 交互优化
- [x] 保存toast提示
### components规划
#### 使用体验
1. 当前有各类column的组件，但是想要将column组件改变方向比较麻烦，需要大量的改动样式, 所以计划实现 布局模块，全部用来布局。 最新的计划是一个容器，可以拖动设置其占比 30% 70% 50% 50% 等

2. 联动表单能力，需求是 改变了商品的选择，以及数量的选择，自动计算金额，所以需要实现
如果需要复杂功能，可以参考amis的事件能力，新增一个值变化事件
值变化可以新增具体的事务，事务分类型：页面跳转、回退、刷新等；服务发送请求等；组件，组件可见性、变量赋值、自定义js等


### 功能特性

#### 低代码编辑器

基于 GrapesJS 实现的可视化编辑器,支持以下核心功能:

1. 格式化模板列表组件
- 支持模板 + 字段变量组合配置
- 自动滚动列表展示
- 编辑器实时预览
- TODO: 数据接口对接

2. 联动表单组件
- 基于 GrapesJS 实现表单联动
- 支持的表单组件:
  - 金额输入
  - 文本输入
  - 单选按钮组
  - 提交按钮
- 联动设计:
  ```typescript
  /**
   * 联动系统设计
   * 
   * 1. 事件流
   * Input/RadioButton 值变化
   * -> field:change 事件
   * -> Form.updateField (检查值是否变化)
   * -> form:data:change 事件 (带有 isFieldUpdate 标记)
   * -> FormItem 接收事件 (检查是否需要处理)
   * -> 如果需要，触发 form:field:change 事件
   * -> 更新显示值
   */
  ```

- 事件系统说明:
  ```
  1. GrapesJS 内部事件 (编辑器层面)
  ┌─────────────────────────────────────┐
  │ Component Events                    │
  │ ├─ change:attributes               │
  │ ├─ change:content                  │
  │ └─ component:*                     │
  └─────────────────────────────────────┘
           ↑↓ 
  ┌─────────────────────────────────────┐
  │ Editor Events                       │
  │ ├─ load                           │
  │ ├─ storage:load                    │
  │ └─ canvas:update                   │
  └─────────────────────────────────────┘

  2. 自定义事件 (运行时联动)
  ┌─────────────────────────────────────┐
  │ Input/RadioButton                   │
  │ └─ input/click                     │
  └───────────────┬─────────────────────┘
                  ↓
  ┌─────────────────────────────────────┐
  │ FormItem                            │
  │ ├─ field:change                    │
  │ └─ form:field:change               │
  └───────────────┬─────────────────────┘
                  ↓
  ┌─────────────────────────────────────┐
  │ Form                                │
  │ ├─ form:data:change                │
  │ ├─ form:submit                     │
  │ └─ form:submit:result              │
  └─────────────────────────────────────┘

  3. 事件流程示例
  ```
  ┌─────────────┐     field:change     ┌──────────┐    updateField()    ┌──────────┐
  │ Input/Radio │ ─────────────────────> FormItem  │ ─────────────────> │   Form   │
  └─────────────┘   {value: newValue}  └──────────┘  {name, value}     └──────────┘
         ▲                                                                    │
         │                                                                    │
         │                                                                    ▼
  ┌─────────────┐    form:field:change  ┌──────────┐   form:data:change   ┌──────────┐
  │ Input/Radio │ <───────────────────── FormItem  │ <─────────────────── │   Form   │
  └─────────────┘    {value, formData}  └──────────┘  {formData, source}  └──────────┘

  事件传递过程：
  1. 用户输入触发
     Input/Radio ──(用户输入)──> field:change
     - 携带新值 {value: newValue}
  
  2. FormItem 中转
     FormItem ──(收到 field:change)──> 调用 form.updateField()
     - 携带字段信息 {name, value}
  
  3. Form 数据更新
     Form ──(更新数据)──> form:data:change
     - 携带完整表单数据 {formData, source}
  
  4. FormItem 分发
     FormItem ──(收到 form:data:change)──> form:field:change
     - 携带字段数据 {value, formData}
  
  5. Input/Radio 更新
     Input/Radio ──(收到 form:field:change)──> 更新显示值
     - 如果有表达式，计算新值
     - 如果是触发源，则跳过更新

  防循环机制工作点：
  * FormItem: 检查 source 是否为自身
  * Input/Radio: 检查 source 是否为自身
  * Form: 检查值是否发生变化
  ```
- 防循环机制:
  ```typescript
  /**
   * 1. 值变化检查
   * if (this.formData[name] === value) {
   *   return; // 值没有变化，不触发更新
   * }
   * 
   * 2. 来源检查
   * if (source === el) {
   *   return; // 是自己触发的变化，不处理
   * }
   * 
   * 3. 更新标记
   * detail: { 
   *   isFieldUpdate: true, // 标记这是一个字段更新事件
   *   source: el,         // 记录触发源
   *   ...
   * }
   */
  ```

- 表达式支持:
  ```typescript
  /**
   * 1. 表达式定义
   * <input expression="form.price * form.quantity" />
   * <input expression="form.userType === 'vip' ? form.price * 0.8 : form.price" />
   * 
   * 2. 表达式执行
   * const form = formData;
   * const calculate = new Function('form', `return ${expression}`);
   * const newValue = calculate(form);
   * 
   * 3. 表达式上下文
   * - form: 整个表单的数据对象
   * - 支持所有 JavaScript 表达式
   * - 可以访问表单中的任何字段
   * - 支持条件运算和数学计算
   */
  ```
- 组件职责:
  - Form: 管理表单数据，处理提交
  - FormItem: 处理字段联动，管理标签
  - Input/AmountInput: 处理用户输入，执行表达式，也可以触发联动
  - RadioButtonGroup: 处理选项切换，触发联动
  
- TODO: 
  - 添加更多表单组件
  - 支持复杂联动规则
  - 增加表单验证

3. 商品组件（计划中）
- 支持两级商品配置
- 第一级：商品本身
- 第二级：商品单位
- 选择联动自动计算金额
- 增强表单联动能力

### 技术实现

#### 组件开发规范

1. 目录结构
```
src/plugins/
  ├── formatTempList/     # 格式化模板列表
  │   ├── components.ts   # 组件定义
  │   ├── blocks.ts       # 块配置
  │   └── index.ts        # 插件入口
  └── linkageForm/        # 联动表单
      ├── components.ts
      ├── blocks.ts
      └── index.ts
```
2. 组件开发流程

- 定义组件接口和配置
- 实现编辑器交互
- 开发预览功能
- 处理数据联动
- 添加导出逻辑

3. 代码规范

- 使用 TypeScript 开发
- 遵循 GrapesJS 插件规范
- 保持组件独立性
- 完善类型定义

#### 待优化项

1. 脚本管理
- 当前状态：script 直接写在 root 配置中
- 优化方向：将脚本移至各个组件
- 或统一使用 API 挂载处理
- TODO: 研究 GrapesJS 最佳实践

2 后续计划
- 整理和规范化代码
- 完善联动表单组件
- 实现商品能力
- 优化脚本管理


### 开发环境配置

#### MongoDB 设置

你需要设置 MongoDB 连接字符串以及 `next-auth` 所需的环境变量：

```
MONGO_URI=mongodb://localhost:27017/temple-h5-editor?replicaSet=rs0retryWrites=true&w=majority
```

#### 认证配置
```
NEXTAUTH_SECRET=<密钥>
GOOGLE_APP_CLIENT_ID=<Google OAuth Client ID>
GOOGLE_APP_CLIENT_SECRET=<Google OAuth Client Secret>
NEXTAUTH_URL=http://localhost:3000  # 开发环境

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

### 数据模型

#### Issue（活动）

```
model Issue {
  id          String      @id @default(auto()) @map("_id") @db.ObjectId
  title       String      // 活动标题
  content     Json        // GrapesJS 页面内容
  formConfig  Json        // 表单配置
  startTime   DateTime?   // 活动开始时间
  endTime     DateTime?   // 活动结束时间
  wxPayConfig Json?      // 微信支付配置
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  submissions Submission[] // 关联的提交记录
}
```

#### 字段说明
- `content`: 使用 Tiptap 编辑器存储的 JSON 内容
  - 支持富文本编辑
  - 自定义 Extension 实现表单联动
  - 支持图文混排
  - 可嵌入动态列表展示参与者信息

- `formConfig`: 表单配置 JSON
  - 定义表单字段和验证规则
  - 配置字段间的联动关系
  - 设置金额计算规则
  - 自定义表单展示样式

- `wxPayConfig`: 微信支付配置
  - 支付参数配置
  - 商品信息设置
  - 支付回调配置

#### Submission（提交记录）

```
model Submission {
  id         String       @id @default(auto()) @map("_id") @db.ObjectId
  formData   Json        // 表单提交数据
  amount     Float       // 支付金额
  paymentId  String?     // 支付订单号
  status     PaymentStatus @default(PENDING)  // 支付状态
  openid     String?     // 微信支付用户标识
  wxPayInfo  Json?      // 微信支付结果信息
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt

  issueId    String     @db.ObjectId  // 关联的活动ID
  issue      Issue      @relation(fields: [issueId], references: [id])
}
```



#### 字段说明
- `formData`: 存储用户提交的表单数据
- `amount`: 根据表单选择计算的最终支付金额
- `status`: 支付状态流转
- `wxPayInfo`: 存储微信支付的详细信息

### 业务流程

1. 活动创建
   - 管理员创建新的 Issue
   - 使用 Tiptap 编辑器配置活动内容
   - 设置表单配置和支付规则

2. 活动展示
   - H5 页面展示富文本内容
   - 动态渲染参与者列表
   - 显示表单供用户填写

3. 用户参与
   - 填写动态表单
   - 根据选择自动计算金额
   - 发起微信支付
   - 创建 Submission 记录

4. 数据统计
   - 跟踪支付状态
   - 统计参与人数和金额
   - 导出活动数据

### 技术实现要点

1. Tiptap 扩展开发
   - 自定义表单联动 Extension
   - 实现动态列表展示 Extension
   - 配置序列化和反序列化

2. 表单配置
   - 支持字段间联动
   - 动态计算金额
   - 实时验证

3. 支付集成
   - 微信支付接口对接
   - 支付状态同步
   - 退款处理

4. 数据展示
   - 实时更新参与者列表
   - 支付状态实时反馈
   - 数据导出功能


### 相关文档

- [GrapesJS](https://grapesjs.com/docs/)
- [Next.js](https://nextjs.org/docs)
- [NextAuth](https://next-auth.js.org/getting-started/introduction)
- [MongoDB](https://www.mongodb.com/docs)

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

### 使用示例:
  ```typescript
  // 1. VIP价格计算示例
  {
    type: 'form',
    components: [
      {
        type: 'form-item',
        attributes: { name: 'userType', label: '用户类型' },
        components: [{
          type: 'radio-button-group',
          attributes: { value: 'normal' },
          components: [
            { type: 'radio-button', attributes: { value: 'normal', label: '普通用户' }},
            { type: 'radio-button', attributes: { value: 'vip', label: 'VIP用户' }}
          ]
        }]
      },
      {
        type: 'form-item',
        attributes: { name: 'price', label: '商品价格' },
        components: [{
          type: 'amount-input',
          attributes: { placeholder: '请输入商品价格' }
        }]
      },
      {
        type: 'form-item',
        attributes: { name: 'finalPrice', label: '最终价格' },
        components: [{
          type: 'amount-input',
          attributes: {
            disabled: 'true',
            expression: 'form.userType === "vip" ? form.price * 0.8 : form.price'
          }
        }]
      }
    ]
  }

  // 2. 数量金额联动示例
  {
    type: 'form-item',
    attributes: { name: 'quantity', label: '数量' },
    components: [{
      type: 'input',
      attributes: { type: 'number', min: '1' }
    }]
  },
  {
    type: 'form-item',
    attributes: { name: 'total', label: '总金额' },
    components: [{
      type: 'amount-input',
      attributes: {
        disabled: 'true',
        expression: 'form.price * form.quantity'
      }
    }]
  }
  ```

- 开发指南:
  1. 添加新的表单组件
  ```typescript
  // 1. 在 components.ts 中定义组件类型
  export const typeNewInput = 'new-input';
  
  // 2. 添加组件定义
  Components.addType(typeNewInput, {
    isComponent: el => el.classList?.contains('new-input'),
    model: {
      defaults: {
        // 基础配置...
        script: function() {
          const el = this;
          const formItem = el.closest('.form-item');
          
          if (formItem) {
            // 监听用户输入
            el.addEventListener('input', (e) => {
              const event = new CustomEvent('field:change', {
                detail: { value: e.target.value }
              });
              formItem.dispatchEvent(event);
            });

            // 处理联动更新
            formItem.addEventListener('form:field:change', (e) => {
              const { value, formData, source } = e.detail;
              if (source === el) return;  // 防循环
              
              // 处理表达式
              const expression = el.getAttribute('expression');
              if (expression) {
                // 计算新值...
              }
            });
          }
        }
      }
    }
  });
  ```

  2. 联动注意事项
  - 始终使用 `field:change` 事件通知值变化
  - 在处理联动时检查 source 避免循环
  - 表达式计算后只更新显示值，不触发新事件
  - 使用 `formItem` 作为事件中转站
  
  3. 调试技巧
  - 使用 console.log 跟踪事件流
  - 检查 formData 对象的变化
  - 验证表达式计算结果
  - 观察防循环机制是否生效
