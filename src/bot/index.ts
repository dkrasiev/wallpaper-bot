import { conversations, createConversation } from '@grammyjs/conversations'
import { hydrateFiles } from '@grammyjs/files'
import { RedisAdapter } from '@grammyjs/storage-redis'
import {
  Bot,
  InlineKeyboard,
  InputFile,
  InputMediaBuilder,
  session,
} from 'grammy'
import Jimp from 'jimp'

import { ENV } from '../config'
import { redis } from '../frameworks/ioredis'
import { updateBackgroundColor, updateWallpaperSize } from './conversations'
import {
  BotCommand,
  ConversationId,
  MyApi,
  MyContext,
  MySession,
  QueryData,
} from './types'
import { createWallpaper, numToHex } from './utils'

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

bot.use(async (ctx, next) => {
  console.log(ctx.message)
  await next()
})

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

bot.command(BotCommand.CONFIG, async (ctx) => {
  let reply_markup = new InlineKeyboard()
    .text('Configure wallpaper size', QueryData.WALLPAPER_SIZE_CONFIG)
    .row()
    .text('Configure background color', QueryData.BACKGROUND_COLOR_CONFIG)

  if (ctx.session.config.backgroundColor) {
    reply_markup = reply_markup.text(
      'Use dynamic color',
      QueryData.BACKGROUND_COLOR_RESET,
    )
  }

  const { wallpaperSize, backgroundColor } = ctx.session.config
  const text = [
    'Your config:',
    `Wallpaper size: ${wallpaperSize.width}x${wallpaperSize.height}`,
    `Background color: ${
      backgroundColor ? numToHex(backgroundColor) : 'dynamic'
    }`,
  ].join('\n')

  await ctx.reply(text, { reply_markup })
})

bot.callbackQuery(QueryData.WALLPAPER_SIZE_CONFIG, async (ctx) => {
  await ctx.conversation.exit()
  await ctx.answerCallbackQuery()
  await ctx.conversation.enter(ConversationId.WALLPAPER_SIZE)
})
bot.callbackQuery(QueryData.BACKGROUND_COLOR_CONFIG, async (ctx) => {
  await ctx.conversation.exit()
  await ctx.answerCallbackQuery()
  await ctx.conversation.enter(ConversationId.BACKGROUND_COLOR)
})
bot.callbackQuery(QueryData.BACKGROUND_COLOR_RESET, async (ctx) => {
  ctx.session.config.backgroundColor = undefined
  await ctx.reply(
    "Reset color, image's average color will be used as a background color",
  )
  await ctx.answerCallbackQuery()
})

bot.on(['message:photo', 'message:document'], async (ctx) => {
  let imageId: string | undefined

  if (ctx.message.photo) {
    imageId = ctx.message.photo.at(-1)?.file_id
  } else if (ctx.message.document) {
    if (ctx.message.document.mime_type?.includes('image')) {
      imageId = ctx.message.document.file_id
    } else {
      await ctx.reply('Document is not an image')
    }
  } else {
    await ctx.reply('Photo not found')
  }

  if (!imageId) {
    return
  }

  await ctx.reply('Processing...')
  const image = await bot.api
    .getFile(imageId)
    .then((file) => file.download())
    .then((path) => Jimp.create(path))
  const { wallpaperSize, backgroundColor } = ctx.session.config

  const lockScreenWallpaper = await createWallpaper({
    image,
    size: wallpaperSize,
    backgroundColor,
    top: false,
  })
  const homeScreenWallpaper = await createWallpaper({
    image,
    size: wallpaperSize,
    backgroundColor,
    top: true,
  })

  // send files in media group
  await ctx.replyWithMediaGroup([
    InputMediaBuilder.document(
      new InputFile(
        await lockScreenWallpaper.getBufferAsync('image/png'),
        'lockscreen.png',
      ),
    ),
    InputMediaBuilder.document(
      new InputFile(
        await homeScreenWallpaper.getBufferAsync('image/png'),
        'homescreen.png',
      ),
    ),
  ])
})
