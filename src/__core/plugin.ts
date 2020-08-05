// plugins of internal, and options keys are not in plugins key, just like hooks, watch
// plugins of third, and options keys are in plugins key
type pluginType = 'internal' | 'third'

export const plugins: Array<{
  type: pluginType
  key: string
  fn: (ins: any, obj: any) => void
}> = []

const usedKeys = [
  // okeen reserved keys if future need
  'state',
  'computed',
  'effects',
  'update',
  'watch',
  'hooks',
]

export function registerPlugin(
  key: string,
  fn: (ins: any, obj: any) => void,
  type: pluginType = 'third',
) {
  if (usedKeys.indexOf(key) !== -1) {
    console.error(`[okeen]: cannot register plugin with reserved key (${key})`)
    return
  }

  if (plugins.filter((item) => item.key === key).length > 0) {
    console.error(`[okeen]: cannot register duplicate plugin (${key})`)
    return
  }
  plugins.push({
    key,
    type,
    fn,
  })
}
