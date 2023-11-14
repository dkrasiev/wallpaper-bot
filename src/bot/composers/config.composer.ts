import { Composer, InlineKeyboard } from 'grammy'

import { BotCommand, ConversationId, MyContext, QueryData } from '../types'
import { numToHex } from '../utils'

export const configComposer = new Composer<MyContext>()

configComposer.command(BotCommand.CONFIG, async (ctx) => {
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

configComposer.callbackQuery(QueryData.WALLPAPER_SIZE_CONFIG, async (ctx) => {
  await ctx.conversation.exit()
  await ctx.answerCallbackQuery()
  await ctx.conversation.enter(ConversationId.WALLPAPER_SIZE)
})

configComposer.callbackQuery(QueryData.BACKGROUND_COLOR_CONFIG, async (ctx) => {
  await ctx.conversation.exit()
  await ctx.answerCallbackQuery()
  await ctx.conversation.enter(ConversationId.BACKGROUND_COLOR)
})

configComposer.callbackQuery(QueryData.BACKGROUND_COLOR_RESET, async (ctx) => {
  ctx.session.config.backgroundColor = undefined
  await ctx.reply(
    "Reset color, image's average color will be used as a background color",
  )
  await ctx.answerCallbackQuery()
})
