import { MyContext, MyConversation } from '../types'
import { parseColor } from '../utils'

export async function updateBackgroundColor(
  conversation: MyConversation,
  ctx: MyContext,
) {
  await ctx.reply('What color do you want?')
  const inputColor = await conversation.form.text()

  const color = parseColor(inputColor)

  conversation.session.config.backgroundColor = color

  await ctx.reply(
    'New background color: #' + color.toString(16).padStart(8, '0'),
  )
}
