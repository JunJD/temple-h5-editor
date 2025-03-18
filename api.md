# Temple H5 编辑器 API 文档

本文档详细描述了Temple H5低代码平台的所有API接口。

## 目录

- [认证 API](#认证-api)
- [活动 API](#活动-api)
- [表单提交 API](#表单提交-api)
- [支付 API](#支付-api)
- [微信 API](#微信-api)
- [预览 API](#预览-api)
- [用户偏好 API](#用户偏好-api)

## 认证 API

### 1. NextAuth 认证

- **端点**: `/api/auth/[...nextauth]`
- **方法**: `GET`, `POST`
- **描述**: 处理 NextAuth 认证系统的请求，支持 Google 登录
- **参数**: 由 NextAuth 自动处理
- **返回**: 认证结果或重定向
- **实现**: 使用 NextAuth 库处理认证流程
- **安全性**: 使用OAuth 2.0协议，安全性由NextAuth框架保证

## 活动 API

### 1. 获取特定活动

- **端点**: `/api/issues/[id]`
- **方法**: `GET`
- **描述**: 获取指定ID的活动详情
- **参数**: 
  - `id`: 活动ID (路径参数)
- **返回**: 活动详情对象，包含内容、表单配置等
- **状态码**: 
  - `200`: 成功返回活动详情
  - `404`: 活动不存在
  - `500`: 服务器错误
- **示例返回**:
  ```json
  {
    "id": "5f8d0e352a...",
    "title": "活动标题",
    "content": { "json格式的页面内容" },
    "formConfig": { "json格式的表单配置" },
    "startTime": "2023-01-01T00:00:00Z",
    "endTime": "2023-12-31T23:59:59Z",
    "wxPayConfig": { "json格式的微信支付配置" },
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T00:00:00Z"
  }
  ```

### 2. 更新活动

- **端点**: `/api/issues/[id]`
- **方法**: `PUT`
- **描述**: 更新指定ID的活动内容
- **参数**:
  - `id`: 活动ID (路径参数)
  - `content`: 活动内容 (请求体)
  - `title`: 活动标题 (请求体，可选)
  - `formConfig`: 表单配置 (请求体，可选)
  - `startTime`: 活动开始时间 (请求体，可选)
  - `endTime`: 活动结束时间 (请求体，可选)
  - `wxPayConfig`: 微信支付配置 (请求体，可选)
- **请求体示例**:
  ```json
  {
    "title": "更新后的活动标题",
    "content": { "json格式的页面内容" },
    "formConfig": { "json格式的表单配置" }
  }
  ```
- **返回**: 更新后的活动对象
- **状态码**:
  - `200`: 更新成功
  - `400`: 请求参数错误
  - `404`: 活动不存在
  - `500`: 服务器错误

### 3. 创建活动

- **端点**: `/api/issues`
- **方法**: `POST`
- **描述**: 创建新的活动
- **参数**:
  - `title`: 活动标题 (请求体)
  - `content`: 活动内容 (请求体)
  - `formConfig`: 表单配置 (请求体，可选)
  - `startTime`: 活动开始时间 (请求体，可选)
  - `endTime`: 活动结束时间 (请求体，可选)
  - `wxPayConfig`: 微信支付配置 (请求体，可选)
- **请求体示例**:
  ```json
  {
    "title": "新活动",
    "content": { "json格式的页面内容" },
    "formConfig": { "json格式的表单配置" },
    "startTime": "2023-01-01T00:00:00Z",
    "endTime": "2023-12-31T23:59:59Z"
  }
  ```
- **返回**: 新创建的活动对象
- **状态码**:
  - `201`: 创建成功
  - `400`: 请求参数错误
  - `500`: 服务器错误

## 表单提交 API

### 1. 获取活动提交记录

- **端点**: `/api/submissions`
- **方法**: `GET`
- **描述**: 获取某个活动的所有提交记录
- **参数**:
  - `issueId`: 活动ID (查询参数，必填)
- **返回**: 提交记录列表
- **状态码**:
  - `200`: 成功返回提交记录
  - `400`: 缺少必要参数
  - `500`: 服务器错误
- **示例返回**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "5f8d0e352a...",
        "formData": { "name": "张三", "phone": "13800138000" },
        "amount": 100.5,
        "paymentId": "pay123456",
        "status": "PAID",
        "openid": "wx_openid_123",
        "wxPayInfo": { "json格式的支付信息" },
        "createdAt": "2023-01-01T00:00:00Z",
        "updatedAt": "2023-01-01T00:00:00Z"
      }
    ]
  }
  ```

### 2. 提交统计 API

- **端点**: `/api/submissions/stats`
- **方法**: `GET`
- **描述**: 提供提交记录的统计信息
- **参数**:
  - `issueId`: 活动ID (查询参数，必填)
- **返回**: 统计信息对象
- **示例返回**:
  ```json
  {
    "success": true,
    "data": {
      "totalSubmissions": 100,
      "paidSubmissions": 85,
      "totalAmount": 8500.5,
      "averageAmount": 100.01,
      "submissionsByDay": [
        { "date": "2023-01-01", "count": 10 },
        { "date": "2023-01-02", "count": 15 }
      ]
    }
  }
  ```
- **状态码**:
  - `200`: 成功返回统计信息
  - `400`: 缺少必要参数
  - `500`: 服务器错误

### 3. 获取特定提交记录

- **端点**: `/api/submissions/[id]`
- **方法**: `GET`
- **描述**: 获取特定ID的提交记录详情
- **参数**:
  - `id`: 提交记录ID (路径参数)
- **返回**: 提交记录详情对象
- **状态码**:
  - `200`: 成功返回提交记录
  - `404`: 提交记录不存在
  - `500`: 服务器错误

### 4. 更新特定提交记录

- **端点**: `/api/submissions/[id]`
- **方法**: `PUT`
- **描述**: 更新特定ID的提交记录
- **参数**:
  - `id`: 提交记录ID (路径参数)
  - `formData`: 表单数据 (请求体，可选)
  - `status`: 支付状态 (请求体，可选)
  - `amount`: 支付金额 (请求体，可选)
  - `wxPayInfo`: 微信支付信息 (请求体，可选)
- **请求体示例**:
  ```json
  {
    "status": "PAID",
    "wxPayInfo": { "transactionId": "wx123456789" }
  }
  ```
- **返回**: 更新后的提交记录对象
- **状态码**:
  - `200`: 更新成功
  - `400`: 请求参数错误
  - `404`: 提交记录不存在
  - `500`: 服务器错误

### 5. 创建提交记录

- **端点**: `/api/submissions`
- **方法**: `POST`
- **描述**: 创建新的表单提交记录
- **参数**:
  - `issueId`: 活动ID (请求体)
  - `formData`: 表单数据 (请求体)
  - `amount`: 支付金额 (请求体，可选)
  - `openid`: 微信用户标识 (请求体，可选)
- **请求体示例**:
  ```json
  {
    "issueId": "5f8d0e352a...",
    "formData": { "name": "张三", "phone": "13800138000" },
    "amount": 100.5,
    "openid": "wx_openid_123"
  }
  ```
- **返回**: 新创建的提交记录对象
- **状态码**:
  - `201`: 创建成功
  - `400`: 请求参数错误
  - `500`: 服务器错误

## 支付 API

### 1. 创建支付

- **端点**: `/api/payment/create`
- **方法**: `POST`
- **描述**: 创建微信支付订单
- **参数**:
  - `issueId`: 活动ID (请求体)
  - `formData`: 表单数据 (请求体)
  - `amount`: 支付金额 (请求体)
  - `openid`: 微信用户标识 (请求体)
  - `userInfo`: 用户信息 (请求体，可选)
- **请求体示例**:
  ```json
  {
    "issueId": "5f8d0e352a...",
    "formData": { "name": "张三", "phone": "13800138000" },
    "amount": 100.5,
    "openid": "wx_openid_123",
    "userInfo": { "nickname": "用户昵称" }
  }
  ```
- **返回**: 微信支付参数或错误信息
- **示例返回**:
  ```json
  {
    "success": true,
    "data": {
      "appId": "wx123456",
      "timeStamp": "1609459200",
      "nonceStr": "random_string",
      "package": "prepay_id=wx123456789",
      "signType": "MD5",
      "paySign": "signature_string",
      "submissionId": "5f8d0e352a..."
    }
  }
  ```
- **状态码**:
  - `200`: 创建订单成功
  - `400`: 请求参数错误
  - `500`: 服务器错误
- **安全性**: 敏感支付信息加密传输

### 2. 支付通知

- **端点**: `/api/payment/notify`
- **方法**: `POST`
- **描述**: 处理微信支付回调通知
- **参数**: 微信支付通知数据 (XML格式)
- **返回**: 处理结果 (XML格式)
- **安全性**: 
  - 验证微信签名
  - 验证订单金额
  - 幂等处理，避免重复回调
- **示例返回** (XML格式):
  ```xml
  <xml>
    <return_code><![CDATA[SUCCESS]]></return_code>
    <return_msg><![CDATA[OK]]></return_msg>
  </xml>
  ```
- **处理流程**:
  1. 验证签名
  2. 解析XML数据
  3. 查询对应的提交记录
  4. 更新支付状态
  5. 返回处理结果

## 微信 API

### 1. 微信授权

- **端点**: `/api/wechat/auth`
- **方法**: `GET`
- **描述**: 处理微信授权流程，获取用户openid
- **参数**:
  - `code`: 微信授权码 (查询参数)
  - `state`: 状态参数，包含重定向URL (查询参数)
- **返回**: 重定向到原始URL，并附加openid和用户信息参数
- **安全性**:
  - 验证state参数防止CSRF攻击
  - 加密存储openid
- **特殊说明**:
  - 该接口需要在微信网页内使用

### 2. 微信JS配置

- **端点**: `/api/wechat/jsconfig`
- **方法**: `GET`
- **描述**: 提供微信JSSDK配置信息
- **参数**:
  - `url`: 当前页面URL (查询参数)
- **返回**: JSSDK配置对象
- **示例返回**:
  ```json
  {
    "success": true,
    "data": {
      "appId": "wx123456",
      "timestamp": 1609459200,
      "nonceStr": "random_string",
      "signature": "signature_string",
      "jsApiList": ["chooseWXPay", "updateAppMessageShareData", "onMenuShareTimeline", "onMenuShareAppMessage"]
    }
  }
  ```
- **状态码**:
  - `200`: 成功返回配置
  - `400`: URL参数缺失或无效
  - `500`: 服务器错误
- **安全性**:
  - 签名验证
  - 时间戳限制有效期

## 预览 API

### 1. 预览活动

- **端点**: `/api/preview/[id]`
- **方法**: `GET`
- **描述**: 提供活动预览功能
- **参数**:
  - `id`: 活动ID (路径参数)
- **返回**: 活动预览数据或重定向到预览页面
- **状态码**:
  - `200`: 成功返回预览数据
  - `404`: 活动不存在
  - `500`: 服务器错误
- **安全性**:
  - 预览链接可设置有效期
  - 支持预览密码保护（可选）

## 用户偏好 API

### 1. 获取用户偏好设置

- **端点**: `/api/preferences`
- **方法**: `GET`
- **描述**: 获取当前用户的偏好设置
- **参数**: 无
- **返回**: 用户偏好设置对象
- **示例返回**:
  ```json
  {
    "theme": "dark",
    "language": "zh-CN",
    "editorSettings": {
      "fontSize": 14,
      "autoSave": true,
      "indentSize": 2
    },
    "notifications": {
      "email": true,
      "push": false
    }
  }
  ```
- **状态码**:
  - `200`: 成功返回偏好设置
  - `401`: 未授权
  - `500`: 服务器错误

### 2. 更新用户偏好设置

- **端点**: `/api/preferences`
- **方法**: `PUT` 或 `POST`
- **描述**: 更新当前用户的偏好设置
- **参数**: 偏好设置数据 (请求体)
- **请求体示例**:
  ```json
  {
    "theme": "light",
    "editorSettings": {
      "fontSize": 16
    }
  }
  ```
- **返回**: 更新后的偏好设置对象
- **状态码**:
  - `200`: 更新成功
  - `400`: 请求参数错误
  - `401`: 未授权
  - `500`: 服务器错误
- **说明**: 支持部分更新，未提供的字段保持原值不变

## 技术实现说明

### 认证流程

1. 后台管理使用 NextAuth 实现 Google 认证
2. H5 页面使用微信授权获取用户 openid
3. 认证状态通过 JWT 令牌和 Session 存储
4. 支持会话持久化和自动刷新

### 表单提交流程

1. 用户填写表单
2. 提交表单数据
3. 创建支付订单
4. 发起微信支付
5. 支付通知更新状态
6. 支付成功后可触发自定义事件（如发送邮件通知）

### 微信支付集成

1. 使用微信支付统一下单接口
2. 通过 nanoid 生成唯一订单号
3. 支持支付结果回调处理
4. 存储支付记录
5. 支持退款处理

### 安全考虑

1. API 路由使用适当的请求方法
2. 支付关键信息加密存储
3. 微信回调通知验证签名
4. 用户认证状态验证
5. 输入数据验证和清洗
6. CSRF 防护
7. 频率限制防止滥用

## 数据模型

### Issue（活动）

```prisma
model Issue {
  id          String      @id @default(auto()) @map("_id") @db.ObjectId
  title       String      // 活动标题
  content     Json        // GrapesJS 页面内容
  formConfig  Json        // 表单配置
  startTime   DateTime?   // 活动开始时间
  endTime     DateTime?   // 活动结束时间
  wxPayConfig Json?       // 微信支付配置
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  submissions Submission[] // 关联的提交记录
}
```

### Submission（提交记录）

```prisma
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

enum PaymentStatus {
  PENDING   // 待支付
  PAID      // 已支付
  FAILED    // 支付失败
  REFUNDED  // 已退款
  EXPIRED   // 已过期
}
```

### UserPreference（用户偏好）

```prisma
model UserPreference {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  userId      String    // 用户ID
  preferences Json      // 偏好设置JSON
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

## 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200    | 请求成功 |
| 201    | 资源创建成功 |
| 400    | 请求参数错误 |
| 401    | 未授权 |
| 403    | 禁止访问 |
| 404    | 资源不存在 |
| 429    | 请求频率超限 |
| 500    | 服务器内部错误 |

## 错误处理

所有API接口在出错时将返回统一格式的错误信息:

```json
{
  "success": false,
  "error": "错误描述信息",
  "code": "ERROR_CODE",
  "details": {
    "field": "具体错误字段",
    "message": "具体错误信息"
  }
}
```

### 常见错误代码

| 错误代码 | 说明 |
|----------|------|
| AUTH_ERROR | 认证相关错误 |
| PARAM_ERROR | 参数验证错误 |
| NOT_FOUND | 资源不存在 |
| DB_ERROR | 数据库操作错误 |
| PAY_ERROR | 支付相关错误 |
| WX_ERROR | 微信API相关错误 |
| SERVER_ERROR | 服务器内部错误 |

## API版本控制

当前API版本为v1，未来版本更新将通过URL路径前缀（如`/api/v2/`）进行区分。