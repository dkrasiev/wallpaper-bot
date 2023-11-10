import Jimp from 'jimp'

import { WallpaperSize } from '../types'

export async function createWallpaper(
  image: Jimp,
  { width, height }: WallpaperSize,
): Promise<Jimp> {
  const canvas = await createJimp(width, height)
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

async function createJimp(
  w: number,
  h: number,
  background: number = 0x000000ff,
): Promise<Jimp> {
  return new Promise((resolve) => {
    new Jimp(w, h, background, (err, jimp) => {
      if (err) {
        throw err
      }

      resolve(jimp)
    })
  })
}
