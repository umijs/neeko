// Neeko 最擅长的事情就是伪装，但是有时候学的不太像

import {
  extendObservable,
  computed,
  action,
  isObservableProp,
  flow,
  toJS,
} from 'mobx';

import { getInstance } from './di';
import { isGenerator, assertKeyValid, deprecated } from '../__internal';
import { plugins } from './plugin';
import { model as modelFn } from '../types';

// Neeko 生成实例的方法
function getInstanceByNeeko(fn: <S>(ins: S) => S) {
  function getInsByModel() {
    let ins = {};
    // do not export, fn must be function
    /* istanbul ignore else */
    if (typeof fn === 'function') {
      ins = fn(ins);
    }

    return ins;
  }

  // 为了方便起见，这里直接用一个 {} 作为唯一 uid
  const ins = getInstance<any>({}, getInsByModel);

  ins.$new = () => getInstanceByNeeko(fn);

  return ins;
}

function bindOptions(ins: any, opts: any, cb: (optsKey: string) => void) {
  for (const key in opts) {
    assertKeyValid(ins, key, () => {
      cb(key);
    });
  }
}

function transferState(ins: any, _state: any = {}) {
  bindOptions(ins, _state, (key) => {
    extendObservable(ins, { [key]: _state[key] });
  });
}

function transferRef(ins: any, _ref: any = {}) {
  bindOptions(ins, _ref, (key) => {
    ins[key] = _ref[key];
  });
}

function transferComputed(ins: any, _computed: any = {}) {
  bindOptions(ins, _computed, (key) => {
    const computedKey = computed(_computed[key].bind(ins));

    Object.defineProperty(ins, key, {
      get() {
        return computedKey.get();
      },
    });
  });
}

let updateTask: any[] = [];

// 只有一个 reducers update
function transferReducers(ins: any) {
  // 添加默认的 reducer update
  const update = async (stateOrUpdater: any, nextTick: boolean = false) => {
    // 1. 准备要更新的 state
    let state: any = {};
    if (typeof stateOrUpdater === 'function') {
      const tmpState = {};
      // copy state from ins
      for (const key in ins) {
        if (isObservableProp(ins, key)) {
          Object.defineProperty(tmpState, key, {
            get() {
              if (typeof state[key] === 'undefined') {
                // toJS 有深度复制的功能
                // state[key] = toJS(ins[key]);
                state[key] = toJS(ins[key]);
              }
              return state[key];
            },
            set(v) {
              state[key] = v;
            },
          });
        }
      }

      stateOrUpdater(tmpState);
    } else {
      state = stateOrUpdater;
    }

    // 2. 更新 state
    const task = () => {
      for (const key in state) {
        if (isObservableProp(ins, key)) {
          ins[key] = state[key];
        } else {
          console.error(`[neeko]: cannot update key (${key}) not in state`);
          // extendObservable(ins, { [key]: state[key] });
        }
      }
    };

    updateTask.push(task);

    // nextTick
    if (nextTick) {
      await Promise.resolve();
    }

    // 同步的 update 会顺便消化掉之前积累的 task
    const runAllTask = () => {
      updateTask.forEach((task) => {
        task();
      });
      updateTask = [];
    };

    const taskWithAction = action(runAllTask.bind(ins));
    taskWithAction();
    return;
  };

  ins.$update = update;
}

export function isEffect(fn: (args: any[]) => any) {
  // @ts-ignore
  return typeof fn === 'function' && !!fn.__isEffect;
}

export function setEffect(ins: any, key: string, fn: (args: any[]) => any) {
  fn = fn.bind(ins);
  if (isGenerator(fn)) {
    // TODO: 不推荐用 flow 流程，因为是 generator
    ins[key] = flow(fn);
  } else {
    // ins[key] = action(fn);
    ins[key] = fn;
  }

  ins[key].__isEffect = true;
}

function transferEffects(ins: any, _effects: any = {}) {
  bindOptions(ins, _effects, (key) => {
    setEffect(ins, key, _effects[key]);
  });
}

const model: typeof modelFn = (options: any) => {
  const ins = getInstanceByNeeko((ins) => {
    transferReducers(ins);
    transferState(ins, options.state);
    transferComputed(ins, options.computed);
    transferEffects(ins, options.effects);
    transferRef(ins, options.ref);

    plugins.forEach(({ key, type, fn }) => {
      if (type === 'internal') {
        fn(ins, options[key]);
      } else {
        fn(ins, options.plugins && options.plugins[key]);
      }
    });

    return ins;
  });

  return ins as any;
};

export default model;
