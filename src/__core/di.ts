import { isObservableProp, toJS, runInAction } from 'mobx'
import { testOnly, isTestEnv } from '../__internal'

export type classType<T = any> = { new (...args: any[]): T }

function recordState(instances: Map<any, any>, blackList?: string[]) {
  const data = new Map()
  instances.forEach((value, key) => {
    const observableData = {} as any
    // only record observable data
    Object.keys(value).forEach((k) => {
      // record observable and not in blackList
      if (isObservableProp(value, k) && blackList?.indexOf(k) === -1) {
        observableData[k] = toJS(value[k])
      }
    })

    data.set(key, observableData)
  })

  return data
}

class DI {
  constructor() {
    this.clear = this.clear.bind(this)
    this.register = this.register.bind(this)

    this.getInstance = this.getInstance.bind(this)
    this.goto = this.goto.bind(this)
    this.record = this.record.bind(this)
  }
  private _instancesMap = new Map()

  /**
   * offset of _historyObservableData
   * 0 mean last _historyObservableData
   * -1 mean pre
   */
  private _currentHistory = 0
  /**
   * history of record observable data
   */
  private _historyObservableData: Map<any, any>[] = []

  /**
   * record current _instancesMap
   * return length of records
   */
  record(opts?: { blackList: string[] }) {
    // clear the data after _currentHistory
    this._historyObservableData = this._historyObservableData.slice(
      0,
      this._historyObservableData.length + this._currentHistory,
    )

    // reset _currentHistory
    this._currentHistory = 0
    // record current data
    this._historyObservableData.push(
      recordState(this._instancesMap, opts?.blackList),
    )
    return {
      index: this._currentHistory,
      length: this._historyObservableData.length,
    }
  }

  /**
   * goto history of _historyObservableData
   * return {
   *   success: boolean // really change the state
   *   index: number // current index of record [-x, 0]
   * }
   */
  goto(fn: (current: number) => number) {
    const index = fn(this._currentHistory)
    const ret = {
      success: false,
      index: this._currentHistory,
    }

    if (index > 0) {
      return ret
    }

    if (index <= -this._historyObservableData.length) {
      return ret
    }

    const gotoInstances = this._historyObservableData.slice().reverse()[-index]
    this._currentHistory = index
    // update ins
    runInAction(() => {
      gotoInstances.forEach((value, uid) => {
        const ins = this._instancesMap.get(uid)
        for (const key in value) {
          ins[key] = value[key]
        }
      })
    })

    ret.index = this._currentHistory
    ret.success = true
    return ret
  }

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

const { clear, register, getInstance, goto, record } = new DI()

export { clear, register, getInstance, goto, record }
