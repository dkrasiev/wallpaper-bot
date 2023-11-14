import { run } from '@grammyjs/runner'

import { bot } from './bot'

export async function main(): Promise<void> {
  console.log('start bot')
  await bot.init()
  console.log('running bot', bot.botInfo.username)
  run(bot)
}
