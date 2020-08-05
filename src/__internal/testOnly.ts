import { isTestEnv } from './env'

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
        console.error(
          `[okeen]: cannot use testOnly api (${propertyKey}) without test env`,
        )
      }
      // @ts-ignore
      return origin.apply(this, args)
    }

  descriptor.value = replacer(descriptor.value)
  return descriptor
}

export default testOnly
