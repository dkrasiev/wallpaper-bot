import { Composer } from 'grammy'

import { MyContext } from '../types'

export const logComposer = new Composer<MyContext>()

logComposer.use(async (ctx, next) => {
  console.log(ctx.message)
  await next()
})
