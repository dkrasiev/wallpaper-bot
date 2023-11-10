import { RedisAdapter } from '@grammyjs/storage-redis'

import { redis } from '../frameworks/ioredis'
import { MySession } from './types'

export const redisStorage = new RedisAdapter<MySession>({
  instance: redis,
})
