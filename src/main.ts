import { bot } from './bot'

export async function main(): Promise<void> {
  console.log('start bot')
  await bot.init()
  console.log('bot started', bot.botInfo.username)
  await bot.start()
}
