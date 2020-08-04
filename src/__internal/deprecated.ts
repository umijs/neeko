const deprecatedMessages: string[] = []

export default function deprecated(msg: string, thing?: string): boolean {
  /* istanbul ignore next */
  if (process.env.NODE_ENV === 'production') return false
  if (thing) {
    return deprecated(`'${msg}', use '${thing}' instead.`)
  }
  if (deprecatedMessages.indexOf(msg) !== -1) return false
  deprecatedMessages.push(msg)
  console.error(`[neeko] Deprecated: ${msg}`)

  return true
}
