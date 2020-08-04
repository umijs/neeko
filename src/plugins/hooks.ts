import { registerPlugin } from '../__core/plugin';

declare module '../types' {
  interface IModelOptions<State = {}, Effects = {}, Computed = {}> {
    // this 可以访问 State, Effects, Computed
    hooks?: {
      init?: () => void;
    } & ThisType<CombineObject<State, Effects, Computed>>;
  }
}

const setupHooks = (ins: any, hooks: any = {}) => {
  if (hooks.init) {
    // 延迟 init 执行，以便 plugin 有机会插队
    Promise.resolve().then(() => {
      hooks.init.call(ins);
    });
  }
};

registerPlugin('hooks', setupHooks, 'internal');
