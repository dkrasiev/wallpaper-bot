import { Conversation, ConversationFlavor } from '@grammyjs/conversations'
import { FileApiFlavor, FileFlavor } from '@grammyjs/files'
import { Api, Context, SessionFlavor } from 'grammy'

export interface WallpaperSize {
  width: number
  height: number
}

export interface MySession {
  config: {
    wallpaperSize: WallpaperSize
    backgroundColor?: number
  }
}

export type MyContext = FileFlavor<Context> &
  SessionFlavor<MySession> &
  ConversationFlavor
export type MyApi = FileApiFlavor<Api>
export type MyConversation = Conversation<MyContext>

export const enum BotCommand {
  START = 'start',
  HELP = 'help',
  CONFIG = 'config',
}

export const enum ConversationId {
  BACKGROUND_COLOR = 'background_color',
  WALLPAPER_SIZE = 'wallpaper_size',
}

export const enum QueryData {
  WALLPAPER_SIZE_CONFIG = 'size:config',
  BACKGROUND_COLOR_CONFIG = 'background_color:config',
  BACKGROUND_COLOR_RESET = 'background_color:reset',
}
