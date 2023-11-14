import Jimp from 'jimp'

import { WallpaperSize } from '../types'

export interface WallpaperParams {
  image: Jimp
  size: WallpaperSize
  backgroundColor?: number
  top?: boolean
}

export async function createWallpaper({
  image,
  size,
  backgroundColor,
  top = false,
}: WallpaperParams): Promise<Jimp> {
  const bg = backgroundColor ?? averageColor(image)

  const canvas = new Jimp(size.width, size.height, bg)
  const padding = Math.floor(canvas.getWidth() * 0.1)

  const scaledImage = image
    .clone()
    .scaleToFit(
      Math.floor(canvas.getWidth() - padding * 2),
      Math.floor(canvas.getHeight() * 0.5),
    )

  const paddingTop = top
    ? Math.floor(canvas.getHeight() * 0.45) + scaledImage.getHeight()
    : Math.floor(canvas.getHeight() * 0.5)

  canvas.composite(scaledImage, padding, canvas.getHeight() - paddingTop)

  return canvas
}

function averageColor(image: Jimp): number {
  console.log('before clone')
  return image.clone().resize(1, 1).getPixelColor(0, 0)
}
