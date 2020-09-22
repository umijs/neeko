import * as path from 'path'
import { defineConfig } from 'dumi'

export default defineConfig({
  mode: 'site',
  base: '/neeko',
  publicPath: '/neeko/',
  exportStatic: {},
  hash: true,
  alias: {
    'okeen/react$': path.resolve(__dirname, 'src/react/index.ts'),
  },
})
