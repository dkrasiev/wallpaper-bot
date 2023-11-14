import { conversations, createConversation } from '@grammyjs/conversations'
import { hydrateFiles } from '@grammyjs/files'
import { RedisAdapter } from '@grammyjs/storage-redis'
import { Bot, session } from 'grammy'

import { ENV } from '../config'
import { redis } from '../frameworks/ioredis'
import { configComposer } from './composers/config.composer'
import { logComposer } from './composers/log.composer'
import { wallpaperComposer } from './composers/wallpaper.composer'
import { updateBackgroundColor, updateWallpaperSize } from './conversations'
import {
  BotCommand,
  ConversationId,
  MyApi,
  MyContext,
  MySession,
} from './types'

export const bot = new Bot<MyContext, MyApi>(ENV.BOT_TOKEN)

await bot.api.setMyCommands([
  {
    command: BotCommand.START,
    description: 'start',
  },
  {
    command: BotCommand.HELP,
    description: 'get help',
  },
  {
    command: BotCommand.CONFIG,
    description: 'config your wallpaper',
  },
])

bot.api.config.use(hydrateFiles(bot.token))

function initial(): MySession {
  return {
    config: {
      wallpaperSize: {
        width: 111,
        height: 111,
      },
    },
    state: {
      isProcessing: false,
    },
  }
}
bot.use(
  session({
    initial,
    storage: new RedisAdapter<MySession>({
      instance: redis,
    }),
  }),
)
bot.use(conversations())

bot.use(
  createConversation(updateBackgroundColor, ConversationId.BACKGROUND_COLOR),
)
bot.use(createConversation(updateWallpaperSize, ConversationId.WALLPAPER_SIZE))

bot.use(logComposer)

bot.command(BotCommand.START, async (ctx) => {
  await ctx.reply('Hi! Try /help')
})

bot.command(BotCommand.HELP, async (ctx) => {
  await ctx.reply(
    [
      'Try /wallpaper command to set wallpaper size in format WIDTHxHEIGHT (example: 1080x1920)',
      'And then send me an image for your wallpaper',
      'Use /color to set background color',
    ].join('\n'),
  )
})

bot.use(configComposer)
bot.use(wallpaperComposer)

bot.catch((e) => {
  console.error(e)
})
