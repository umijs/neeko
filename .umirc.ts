import * as path from 'path'

export default {
  mode: 'site',
  alias: {
    'okeen/react$': path.resolve(__dirname,  'src/react/index.ts')
  }
}
