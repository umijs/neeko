import {
  extendObservable,
  computed,
  action,
  isObservableProp,
  flow,
  toJS,
} from 'mobx'

import { getInstance } from './di'
import { isGenerator, assertKeyValid } from '../__internal'
import { plugins } from './plugin'
import { model as modelFn } from '../types'

// okeen generate instance
function getInstanceByOkeen(
  // add key in instance of Neeko
  transferIns: <S>(ins: S) => S,
  // add method in Neeko
  transferProto: <P>(proto: P) => P,
) {
  function getInsByModel() {
    const Neeko = function () {}

    transferProto?.(Neeko.prototype)
    Neeko.prototype.$new = () => getInstanceByOkeen(transferIns, transferProto)

    // @ts-ignore
    let ins = new Neeko()

    // bind ins on each Neeko.prototype
    Object.keys(Neeko.prototype).forEach((method) => {
      Neeko.prototype[method] = Neeko.prototype[method].bind(ins)
    })
    /* istanbul ignore else */
    ins = transferIns?.(ins)

    return ins
  }

  // use {} for uid
  const ins = getInstance<any>({}, getInsByModel)
  return ins
}

function bindOptions(ins: any, opts: any, cb: (optsKey: string) => void) {
  for (const key in opts) {
    assertKeyValid(ins, key, () => {
      cb(key)
    })
  }
}

function transferState(ins: any, _state: any = {}) {
  let opts = _state
  if (typeof _state === 'function') {
    opts = _state.call(undefined)
  }
  bindOptions(ins, opts, (key) => {
    extendObservable(ins, { [key]: opts[key] })
  })
}

function transferRef(ins: any, _ref: any = {}) {
  bindOptions(ins, _ref, (key) => {
    ins[key] = _ref[key]
  })
}

function transferComputed(ins: any, _computed: any = {}) {
  bindOptions(ins, _computed, (key) => {
    const computedKey = computed(_computed[key].bind(ins))

    Object.defineProperty(ins, key, {
      get() {
        // @ts-ignore 这里 ts 有问题，先 ignore
        return computedKey.get()
      },
    })
  })
}

let updateTask: any[] = []

// the only method(like reducer) to change state is $update
function transferReducers(proto: any) {
  // add default $update method
  const update = async function (
    stateOrUpdater: any,
    nextTick: boolean = false,
  ) {
    // @ts-ignore
    const ins = this

    // 1. prepare new state
    let state: any = {}
    if (typeof stateOrUpdater === 'function') {
      const tmpState = {}
      // copy state from ins
      for (const key in ins) {
        if (isObservableProp(ins, key)) {
          Object.defineProperty(tmpState, key, {
            get() {
              if (typeof state[key] === 'undefined') {
                // toJS with deep clone
                state[key] = toJS(ins[key])
              }
              return state[key]
            },
            set(v) {
              state[key] = v
            },
          })
        }
      }

      stateOrUpdater(tmpState)
    } else {
      state = stateOrUpdater
    }

    // 2. update state
    const task = () => {
      for (const key in state) {
        if (isObservableProp(ins, key)) {
          ins[key] = state[key]
        } else {
          console.error(`[okeen]: cannot update key (${key}) not in state`)
          // extendObservable(ins, { [key]: state[key] });
        }
      }
    }

    updateTask.push(task)

    // nextTick
    if (nextTick) {
      await Promise.resolve()
    }

    // sync $update will complete all async tasks
    const runAllTask = () => {
      updateTask.forEach((task) => {
        task()
      })
      updateTask = []
    }

    const taskWithAction = action(runAllTask.bind(ins))
    taskWithAction()
    return
  }
  proto.$update = update
}

export function isEffect(fn: (args: any[]) => any) {
  // @ts-ignore
  return typeof fn === 'function' && !!fn.__isEffect
}

export function setEffect(proto: any, key: string, fn: (args: any[]) => any) {
  if (isGenerator(fn)) {
    // TODO: remove generator flow
    proto[key] = flow(fn)
  } else {
    proto[key] = fn
  }

  proto[key].__isEffect = true
}

function transferEffects(proto: any, _effects: any = {}) {
  bindOptions(proto, _effects, (key) => {
    setEffect(proto, key, _effects[key])
  })
}

const model: typeof modelFn = (options: any) => {
  const ins = getInstanceByOkeen(
    (ins) => {
      transferState(ins, options.state)
      transferComputed(ins, options.computed)
      transferRef(ins, options.ref)

      // register plugins after transfer
      plugins.forEach(({ key, type, fn }) => {
        if (type === 'internal') {
          fn(ins, options[key])
        } else {
          fn(ins, options.plugins && options.plugins[key])
        }
      })

      return ins
    },
    (proto) => {
      transferReducers(proto)
      transferEffects(proto, options.effects)

      return proto
    },
  )

  return ins as any
}

export default model
