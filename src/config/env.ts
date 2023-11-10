import { z } from 'zod'

const enum Env {
  PRODUCTION = 'production',
  DEVELOPMENT = 'development',
}

export const ENV = z
  .object({
    NODE_ENV: z
      .enum([Env.PRODUCTION, Env.DEVELOPMENT])
      .default(Env.DEVELOPMENT),
    BOT_TOKEN: z.string(),
  })
  .parse(process.env)
