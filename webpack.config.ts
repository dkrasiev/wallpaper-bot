import 'dotenv/config'

import NodemonWebpackPlugin from 'nodemon-webpack-plugin'
import path from 'path'
import { Configuration, EnvironmentPlugin, ProgressPlugin } from 'webpack'

interface Env {
  mode?: 'production' | 'development'
}

const config = (env: Env): Configuration => {
  const plugins = [new ProgressPlugin(), new EnvironmentPlugin()]

  const isDev = env.mode ? env.mode === 'development' : true

  if (isDev) {
    plugins.push(new NodemonWebpackPlugin())
  }

  return {
    target: 'node',
    mode: isDev ? 'development' : 'production',
    entry: path.resolve('./src/index.ts'),
    output: {
      path: path.resolve('./dist'),
      clean: true,
    },
    plugins,
    module: {
      rules: [
        {
          test: /.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
  }
}

export default config
