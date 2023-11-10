import { hydrateFiles } from '@grammyjs/files'
import { Bot, InputFile, InputMediaBuilder, session } from 'grammy'
import Jimp from 'jimp'

import { ENV } from '../config'
import { createWallpaper, parseWallpaperSize } from './functions'
import { redisStorage } from './storage'
import { MyApi, MyContext } from './types'

export const bot = new Bot<MyContext, MyApi>(ENV.BOT_TOKEN)

bot.api.config.use(hydrateFiles(bot.token))

bot.use(
  session({
    initial: () => ({
      wallpaperSize: {
        width: 1080,
        height: 1920,
      },
    }),
    storage: redisStorage,
  }),
)

bot.command('start', async (ctx) => {
  await ctx.reply('Hi! Try /help')
})

bot.command('help', async (ctx) => {
  await ctx.reply(
    'Try /wallpaper command to set wallpaper size in format WIDTHxHEIGHT (example: 1080x1920)\nAnd then send me an image for your wallpaper',
  )
})

bot.command('wallpaper', async (ctx) => {
  try {
    const wallpaperSize = parseWallpaperSize(ctx.message.text.split(' ')[1])
    ctx.session.wallpaperSize = wallpaperSize
    await ctx.reply('Size set: ' + JSON.stringify(wallpaperSize))
  } catch {
    await ctx.reply('Invalid size')
  }
})

bot.on(['message:photo', 'message:document'], async (ctx) => {
  let imageId: string

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

  const image = await bot.api
    .getFile(imageId)
    .then((file) => file.download())
    .then((path) => Jimp.create(path))
  const wallpaper = await createWallpaper(image, {
    ...ctx.session.wallpaperSize,
  })

  // send file in media
  await ctx.replyWithMediaGroup([
    InputMediaBuilder.document(
      new InputFile(await wallpaper.getBufferAsync('image/png'), 'result.png'),
    ),
  ])
})
