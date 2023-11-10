import { WallpaperSize } from '../types'

export function parseWallpaperSize(text: string): WallpaperSize {
  const [width, height] = text.split('x')
  return {
    width: parseInt(width),
    height: parseInt(height),
  }
}
