import { MyContext, MyConversation } from '../types'

export async function updateWallpaperSize(
  conversation: MyConversation,
  ctx: MyContext,
) {
  await ctx.reply('What width do you want?')
  const width = await conversation.form.number()

  await ctx.reply('What height do you want?')
  const height = await conversation.form.number()

  conversation.session.config.wallpaperSize = {
    width,
    height,
  }

  await ctx.reply(`Wallpaper size set to ${width}x${height}.`)
}
