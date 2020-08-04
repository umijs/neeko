import { testOnly, isTestEnv } from '../__internal'

export type classType<T = any> = { new (...args: any[]): T }

class DI {
  constructor() {
    this.clear = this.clear.bind(this)
    this.register = this.register.bind(this)

    this.getInstance = this.getInstance.bind(this)
  }
  private _instancesMap = new Map()

  /**
   * test only
   *
   * 清空缓存的数据，用于单元测试间不相互干扰
   */
  @testOnly
  clear() {
    this._instancesMap.clear()
  }

  /**
   * test only
   *
   * 用于需要 mock 依赖的某个 store 的时候
   * 1. register(user.$uid, mockUser)
   * 2. TODO: 使用 Map ?
   * register([
   *  [user.$uid, mockUser],
   *  [home.$uid, mockHome]
   * ])
   * @param target classType
   * @param store new classType()
   */
  @testOnly
  register<S = any, T = any>(uid: S, store: T) {
    // 直接替换
    this._instancesMap.set(uid, store)
  }

  // 需要 使用方实现各自的获取 store 的方法
  // 注意这里的 uid 是一个唯一的，如指针类型，uuid
  getInstance<T>(
    uid: classType<T> | object | string | any,
    fn: () => T,
  ): T & { $uid?: any } {
    const self = this
    // test only
    // 注意这里的 Proxy 只在测试环境中使用
    // 也就是说在生产环境中是没有 register(user.$uid, mockUser) 的操作的
    if (isTestEnv()) {
      const ins = new Proxy(
        // @ts-ignore
        {} as object & T,
        {
          get: function (obj: any, prop) {
            if (prop === '$uid') {
              // 为 test register 的时候指定可选的 $uid
              return uid
            }

            const ins = self._resolve(uid, fn)
            // @ts-ignore
            return ins[prop]
          },
          set: function (obj, prop, value) {
            const ins = self._resolve(uid, fn)
            // @ts-ignore
            ins[prop] = value
            return true
          },
        },
      )

      return ins
    }

    return this._resolve<T>(uid, fn)
  }

  private _resolve<T>(uid: classType<T>, fn: () => T): T {
    // 缓存中获取实例
    if (this._instancesMap.has(uid)) {
      return this._instancesMap.get(uid)
    }

    // 实例化并缓存
    const instance = fn()
    this._instancesMap.set(uid, instance)
    return instance
  }
}

const { clear, register, getInstance } = new DI()

export { clear, register, getInstance }
