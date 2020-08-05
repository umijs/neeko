import {
  extendObservable,
  computed,
  action,
  isObservableProp,
  flow,
  toJS,
} from 'mobx'

import { getInstance } from './di'
import { isGenerator, assertKeyValid, deprecated } from '../__internal'
import { plugins } from './plugin'
import { model as modelFn } from '../types'

// okeen generate instance
function getInstanceByOkeen(fn: <S>(ins: S) => S) {
  function getInsByModel() {
    let ins = {}
    /* istanbul ignore else */
    if (typeof fn === 'function') {
      ins = fn(ins)
    }

    return ins
  }

  // use {} for uid
  const ins = getInstance<any>({}, getInsByModel)

  ins.$new = () => getInstanceByOkeen(fn)

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
  bindOptions(ins, _state, (key) => {
    extendObservable(ins, { [key]: _state[key] })
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
        return computedKey.get()
      },
    })
  })
}

let updateTask: any[] = []

// the only method(like reducer) to change state is $update
function transferReducers(ins: any) {
  // add default $update method
  const update = async (stateOrUpdater: any, nextTick: boolean = false) => {
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

  ins.$update = update
}

export function isEffect(fn: (args: any[]) => any) {
  // @ts-ignore
  return typeof fn === 'function' && !!fn.__isEffect
}

export function setEffect(ins: any, key: string, fn: (args: any[]) => any) {
  fn = fn.bind(ins)
  if (isGenerator(fn)) {
    // TODO: remove generator flow
    ins[key] = flow(fn)
  } else {
    ins[key] = fn
  }

  ins[key].__isEffect = true
}

function transferEffects(ins: any, _effects: any = {}) {
  bindOptions(ins, _effects, (key) => {
    setEffect(ins, key, _effects[key])
  })
}

const model: typeof modelFn = (options: any) => {
  const ins = getInstanceByOkeen((ins) => {
    transferReducers(ins)
    transferState(ins, options.state)
    transferComputed(ins, options.computed)
    transferEffects(ins, options.effects)
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
  })

  return ins as any
}

export default model
