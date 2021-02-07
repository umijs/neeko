export default (ins: any, key: string, cb?: () => void) => {
  if (!ins) {
    return false
  }

  if (key[0] === '$') {
    console.error(`[okeen]: cannot use key (${key}) start with $`)
    return false
  }

  // include key in prototype
  const ret = !(key in ins)

  if (!ret) {
    console.error(`[okeen]: cannot redefine key (${key}) in the model`)
    return false
  }

  cb?.()

  return ret
}
