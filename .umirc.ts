import * as path from 'path'
import { defineConfig } from 'dumi'

export default defineConfig({
  title: 'Okeen',
  logo: 'https://i.loli.net/2020/09/22/1Esb9maMr7gCTko.png',
  favicon: 'https://i.loli.net/2020/09/22/1Esb9maMr7gCTko.png',
  mode: 'site',
  base: '/neeko',
  publicPath: '/neeko/',
  exportStatic: {},
  hash: true,
  outputPath: 'docs_dist',
  alias: {
    'okeen/react$': path.resolve(__dirname, 'src/react/index.ts'),
  },
})
