/**
 * @return Boolean
 */
export function isTestEnv() {
  return (
    typeof process !== 'undefined' &&
    process.env &&
    process.env.NODE_ENV === 'test'
  )
}
