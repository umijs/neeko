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
   * clear all instances for each test case
   */
  @testOnly
  clear() {
    this._instancesMap.clear()
  }

  /**
   * test only
   *
   * use for mock a store by it's $uid
   *
   * register(user.$uid, mockUser)
   * @param target classType
   * @param store new classType()
   */
  @testOnly
  register<S = any, T = any>(uid: S, store: T) {
    this._instancesMap.set(uid, store)
  }

  /**
   * use for mock a store by it's $uid
   *
   * @param uid the uid for a store instance cache in instancesMap, like uuid
   * @param fn method to generate a store
   */
  getInstance<T>(
    uid: classType<T> | object | string | any,
    fn: () => T,
  ): T & { $uid?: any } {
    const self = this
    // test only
    // TODO: remove test only when this.clear, this.register work in production
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
    // get store from instancesMap when uid in instancesMap
    if (this._instancesMap.has(uid)) {
      return this._instancesMap.get(uid)
    }

    // generate new store when uid not in instancesMap
    const instance = fn()
    this._instancesMap.set(uid, instance)
    return instance
  }
}

const { clear, register, getInstance } = new DI()

export { clear, register, getInstance }
