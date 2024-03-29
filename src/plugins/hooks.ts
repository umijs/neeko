import { registerPlugin } from '../__core/plugin'

declare module '../types' {
  interface IModelOptions<State = {}, Effects = {}, Computed = {}> {
    // this with State, Effects, Computed
    hooks?: {
      init?: () => void
    } & ThisType<CombineObject<State, Effects, Computed>>
  }
}

const setupHooks = (ins: any, hooks: any = {}) => {
  if (hooks.init) {
    // async init for plugins register first
    Promise.resolve().then(() => {
      try {
        hooks.init.call(ins)
      } catch (error) {}
    })
  }
}

registerPlugin('hooks', setupHooks, 'internal')
