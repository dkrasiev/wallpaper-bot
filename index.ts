import 'dotenv/config'

// import { main } from './src/main'
import Jimp from 'jimp'
import path from 'path'

import { createWallpaper } from './src/bot/utils/create-wallpaper.js'

// await main()

const imagePath = path.resolve('./assets/input-image.jpg')
const image = await Jimp.read(imagePath)

const lockscreen = await createWallpaper({
  image,
  size: {
    width: 1080,
    height: 2400,
  },
  top: false,
  backgroundColor: 0x000000ff,
})
const homescreen = await createWallpaper({
  image,
  size: {
    width: 1080,
    height: 2400,
  },
  top: true,
  backgroundColor: 0x000000ff,
})

lockscreen.write('./result/lockscreen.png')
homescreen.write('./result/homescreen.png')
