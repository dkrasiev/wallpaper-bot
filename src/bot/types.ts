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

export type MyContext = FileFlavor<Context> & SessionFlavor<MySession>
export type MyApi = FileApiFlavor<Api>
