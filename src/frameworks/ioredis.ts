import { Redis } from 'ioredis'

import { ENV } from '../config'

export const redis = new Redis(ENV.REDIS_URI, {
  keyPrefix: 'wallpaper-bot:',
})
