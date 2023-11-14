import { Composer, InputMediaBuilder } from 'grammy'
import { InputFile } from 'grammy/web'
import Jimp from 'jimp'

import { bot } from '../bot'
import { MyContext } from '../types'
import { createWallpaper } from '../utils'

export const wallpaperComposer = new Composer<MyContext>()

wallpaperComposer.on(['message:photo', 'message:document'], async (ctx) => {
  if (ctx.session.state.isProcessing) {
    await ctx.reply('Already processing, be patient...')
    return
  }

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

  ctx.session.state.isProcessing = true
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

  ctx.session.state.isProcessing = false
})
