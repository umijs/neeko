import {
  extendObservable,
  computed,
  action,
  isObservableProp,
  flow,
  toJS,
} from 'mobx'

import { getInstance, record, goto } from './di'
import { isGenerator, assertKeyValid, throwError } from '../__internal'
import { plugins } from './plugin'
import { model as modelFn } from '../types'

// okeen generate instance
function getInstanceByOkeen(
  // add method and key in Neeko
  transfer: <P, S>(proto: P, ins: S) => S,
) {
  function getInsByModel() {
    const Neeko = function () {}

    // @ts-ignore
    let ins = new Neeko()

    ins = transfer(Neeko.prototype, ins)
    Neeko.prototype.$new = () => getInstanceByOkeen(transfer)

    // bind ins on each Neeko.prototype
    Object.keys(Neeko.prototype).forEach((method) => {
      const boundedMethod = Neeko.prototype[method].bind(ins)

      // copy static on bounded method, eg. __isEffect
      Object.keys(Neeko.prototype[method]).forEach((key) => {
        boundedMethod[key] = Neeko.prototype[method][key]
      })

      Neeko.prototype[method] = boundedMethod
    })

    return ins
  }

  // use {} for uid
  const ins = getInstance<any>({}, getInsByModel)
  return ins
}

function bindOptions(
  ins: any,
  opts: any,
  cb: (optsKey: string, opts: any) => void,
) {
  for (const key in opts) {
    assertKeyValid(ins, key, () => {
      cb(key, opts)
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

// the only method(like reducer) to change state is $update
function transferReducers(proto: any) {
  let updateTask: any[] = []
  // add default $update method
  const update = function (stateOrUpdater: any, nextTick: boolean = false) {
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

    // 1.5 precheck error
    for (const key in state) {
      if (!isObservableProp(ins, key)) {
        throwError(`cannot update key (${key}) not in state`)
      }
    }

    // 2. update state
    const task = () => {
      for (const key in state) {
        // no need check isObservableProp because 1.5 has checked
        ins[key] = state[key]
      }
    }

    updateTask.push(task)

    // sync $update will complete all async tasks
    const runAllTask = () => {
      updateTask.forEach((task) => {
        task()
      })
      updateTask = []
    }

    const taskWithAction = action(runAllTask.bind(ins))

    if (nextTick) {
      // nextTick
      Promise.resolve().then(() => taskWithAction())
    } else {
      taskWithAction()
    }
  }
  proto.$update = update
}

export function isEffect(fn: (args: any[]) => any) {
  // @ts-ignore
  return typeof fn === 'function' && !!fn.__isEffect
}

export function setEffect(ins: any, key: string, fn: (args: any[]) => any) {
  const fixedFn = fn
  // @ts-ignore
  fixedFn.__isEffect = true
  const pro = Object.getPrototypeOf(ins);
  pro && pro[key] = fixedFn
}

export function setEffectProto(
  proto: any,
  key: string,
  fn: (args: any[]) => any,
) {
  const fixedFn = isGenerator(fn) ? flow(fn) : fn
  // @ts-ignore
  fixedFn.__isEffect = true

  proto[key] = fixedFn
}

function transferEffects(proto: any, _effects: any = {}) {
  bindOptions(proto, _effects, (key) => {
    setEffectProto(proto, key, _effects[key])
  })
}

function transferRecord(prop: any, ins: any) {
  extendObservable(ins, { $unstable_recordLength: 0 })
  extendObservable(ins, { $unstable_recordIndex: 0 })

  const $record = () => {
    const { index, length } = record({
      blackList: ['$unstable_recordLength', '$unstable_recordIndex'],
    })
    ins.$update({
      $unstable_recordIndex: index,
      $unstable_recordLength: length,
    })
  }

  const $goto = (fn: (index: number) => number) => {
    const { success, index } = goto(fn)
    if (success) {
      ins.$update({
        $unstable_recordIndex: index,
      })
    }
  }

  prop.$unstable_record = $record
  prop.$unstable_goto = $goto
}

const model: typeof modelFn = (options: any) => {
  const ins = getInstanceByOkeen((proto, ins) => {
    transferReducers(proto)
    transferEffects(proto, options.effects)
    transferRecord(proto, ins)

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
  })

  return ins as any
}

export default model
