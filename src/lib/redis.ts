import Redis from 'ioredis'

// 当未配置 REDIS_URL（或在构建阶段）时，使用内存兜底，避免在构建时尝试连接本地 6379
const shouldUseInMemory = !process.env.REDIS_URL

type InMemoryValue = { value: string; expiresAt: number }

class InMemoryRedis {
  private store = new Map<string, InMemoryValue>()
  // 对齐 ioredis 接口（只实现用到的方法）
  async get(key: string): Promise<string | null> {
    const item = this.store.get(key)
    if (!item) return null
    if (Date.now() > item.expiresAt) {
      this.store.delete(key)
      return null
    }
    return item.value
  }

  async setex(key: string, ttlSeconds: number, value: string): Promise<'OK'> {
    this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 })
    return 'OK'
  }

  // 兼容 ioredis 事件接口
  on(_event: string, _handler: (...args: any[]) => void) {
    // no-op
  }
}

const redisClient = shouldUseInMemory
  ? (() => {
      // 构建/本地开发未配置 REDIS_URL 时不连接 Redis，使用内存缓存并提示
      console.warn(
        '[redis] REDIS_URL not set — using in-memory cache (no persistence).'
      )
      return new InMemoryRedis() as unknown as Redis
    })()
  : (() => {
      const redisUrl = process.env.REDIS_URL as string
      const client = new (Redis as any)(redisUrl, {
        retryStrategy(times: number) {
          const delay = Math.min(times * 50, 2000)
          return delay
        },
      }) as Redis
      ;(client as any).on('error', (err: any) =>
        console.error('Redis Client Error', err)
      )
      ;(client as any).on('connect', () => console.log('Connected to Redis'))
      return client
    })()

export default redisClient
