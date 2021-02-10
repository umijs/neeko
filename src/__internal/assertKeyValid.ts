import throwError from './throwError'

export default (ins: any, key: string, cb?: () => void) => {
  if (!ins) {
    return false
  }

  if (key[0] === '$') {
    throwError(`cannot use key (${key}) start with $`)
  }

  // include key in prototype
  const ret = !(key in ins)

  if (!ret) {
    throwError(`cannot redefine key (${key}) in the model`)
  }

  cb?.()

  return ret
}
