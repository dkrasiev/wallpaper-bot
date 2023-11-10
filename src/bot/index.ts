import { hydrateFiles } from '@grammyjs/files'
import { Bot, InputFile, InputMediaBuilder, session } from 'grammy'
import Jimp from 'jimp'

import { ENV } from '../config'
import { createWallpaper, parseWallpaperSize } from './functions'
import { parseColor } from './functions/parse-color'
import { redisStorage } from './storage'
import { MyApi, MyContext } from './types'
import { trimCommand } from './utils/trim-command'

export const bot = new Bot<MyContext, MyApi>(ENV.BOT_TOKEN)

bot.api.setMyCommands([
  {
    command: 'start',
    description: 'start',
  },
  {
    command: 'help',
    description: 'get help',
  },
  {
    command: 'wallpaper',
    description: 'set wallpaper size',
  },
  {
    command: 'color',
    description: 'set background color',
  },
])

bot.api.config.use(hydrateFiles(bot.token))

bot.use(
  session({
    initial: () => ({
      config: {
        wallpaperSize: {
          width: 1080,
          height: 1920,
        },
      },
    }),
    storage: redisStorage,
  }),
)

// bot.use(async (ctx, next) => {
//   ctx.session = {
//     config: {
//       wallpaperSize: {
//         width: 1080,
//         height: 2400,
//       },
//     },
//   }
//
//   await next()
// })

bot.command('start', async (ctx) => {
  await ctx.reply('Hi! Try /help')
})

bot.command('help', async (ctx) => {
  await ctx.reply(
    [
      'Try /wallpaper command to set wallpaper size in format WIDTHxHEIGHT (example: 1080x1920)',
      'And then send me an image for your wallpaper',
      'Use /color to set background color',
    ].join('\n'),
  )
})

bot.command('wallpaper', async (ctx) => {
  try {
    if (!ctx.message) {
      return
    }
    const wallpaperSize = parseWallpaperSize(ctx.message.text.split(' ')[1])
    ctx.session.config.wallpaperSize = wallpaperSize
    await ctx.reply(
      'Current set: ' + `${wallpaperSize.width}x${wallpaperSize.height}`,
    )
  } catch {
    await ctx.reply('Invalid size')
  }
})

bot.command('color', async (ctx) => {
  try {
    if (!ctx.message) {
      return
    }
    const input = trimCommand(ctx.message.text)
    if (!input) {
      throw new Error('Invalid color')
    }
    const backgroundColor = parseColor(input)
    ctx.session.config.backgroundColor = backgroundColor
    await ctx.reply(`Current color: ${input} (${backgroundColor})`)
  } catch {
    ctx.session.config.backgroundColor = undefined
    await ctx.reply(
      "Reset color, image's average color will be used as a background color",
    )
  }
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

  const image = await bot.api
    .getFile(imageId)
    .then((file) => file.download())
    .then((path) => Jimp.create(path))
  const { wallpaperSize, backgroundColor } = ctx.session.config
  const wallpaper = await createWallpaper(
    image,
    {
      ...wallpaperSize,
    },
    backgroundColor,
  )

  // send file in media
  await ctx.replyWithMediaGroup([
    InputMediaBuilder.document(
      new InputFile(await wallpaper.getBufferAsync('image/png'), 'result.png'),
    ),
  ])
})
