/**
 * 判断是否是测试环境
 * @return Boolean
 */
export function isTestEnv() {
  return (
    typeof process !== 'undefined' &&
    process.env &&
    process.env.NODE_ENV === 'test'
  );
}
