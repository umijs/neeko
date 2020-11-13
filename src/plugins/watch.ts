import { computed, comparer, Lambda, reaction, Reaction } from 'mobx'
import { registerPlugin } from '../__core/plugin'

type WatchHandler<T> = (newVal: T, oldVal: T, disposer: Lambda) => void

type DefineWatch<State = any> = {
  [K in keyof Partial<State>]:
    | WatchHandler<State[K]>
    | {
        handler: WatchHandler<State[K]>
        immediate?: boolean
        deep?: boolean
      }
} & {
  // 'a.b': function() {}
  [key: string]:
    | WatchHandler<any>
    | {
        handler: WatchHandler<any>
        immediate?: boolean
        deep?: boolean
      }
}

declare module '../types' {
  interface IModelOptions<
    State = {},
    Effects = {},
    Computed = {},
    Ref = {},
    Watch = {}
  > {
    // this with State, Effects, Computed
    watch?: Watch & ThisType<CombineObject<State, Effects, Computed, Ref>>
  }

  function model<
    State,
    Effects,
    Computed,
    Ref,
    Watch extends DefineWatch<State>
  >(
    options: IModelOptions<State, Effects, Computed, Ref, Watch>,
  ): CombineObject<State, Effects, Computed, Ref>
}

function setupWatch(ins: any, watch: DefineWatch = {}) {
  for (const key in watch) {
    const value = watch[key]

    let handler: WatchHandler<any>
    let fireImmediately = false
    let equals = comparer.default

    if (typeof value === 'function') {
      handler = value.bind(ins)
    } else if (
      typeof value === 'object' &&
      typeof value.handler === 'function'
    ) {
      handler = value.handler.bind(ins)
      fireImmediately = value.immediate || false
      equals = value.deep ? comparer.structural : comparer.default
    } else {
      return
    }

    // make watch in action
    // handler = action(handler);

    const disposer = reaction(
      () => {
        const segments = key.split('.')
        let obj = ins

        for (let i = 0; i < segments.length; i++) {
          obj = obj[segments[i]]
        }

        return obj
      },
      (newValue, oldValue) => {
        handler(newValue, oldValue, disposer)
      },
      {
        equals: equals,
        fireImmediately,
      },
    )
  }
}

registerPlugin('watch', setupWatch, 'internal')
