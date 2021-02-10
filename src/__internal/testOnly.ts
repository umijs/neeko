import { isTestEnv } from './env'
import throwError from './throwError'

/**
 * test only
 *
 * decorator testOnly
 */
const testOnly = (
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) => {
  const replacer = (origin: any) =>
    function (...args: any[]) {
      if (!isTestEnv()) {
        throwError(`cannot use testOnly api (${propertyKey}) without test env`)
      }
      // @ts-ignore
      return origin.apply(this, args)
    }

  descriptor.value = replacer(descriptor.value)
  return descriptor
}

export default testOnly
