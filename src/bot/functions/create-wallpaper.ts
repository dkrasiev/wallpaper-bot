import Jimp from 'jimp'

import { WallpaperSize } from '../types'

export async function createWallpaper(
  image: Jimp,
  { width, height }: WallpaperSize,
): Promise<Jimp> {
  const color = await averageColor(image)

  const canvas = new Jimp(width, height, color)
  const padding = Math.floor(canvas.getWidth() * 0.1)

  canvas.composite(
    image
      .clone()
      .scaleToFit(
        Math.floor(canvas.getWidth() - padding * 2),
        Math.floor(canvas.getHeight() / 2),
      ),
    padding,
    Math.floor(canvas.getHeight() / 2),
  )

  return canvas
}

async function averageColor(image: Jimp): Promise<number> {
  return await image.clone().resize(1, 1).getPixelColor(0, 0)
}
