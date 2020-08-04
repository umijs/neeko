import { configure } from 'mobx';

// 强制开启严格模式，这样，在 action 外的数据变更会
// 这里使用 observed 而非 always 的原因是避免在 mobx 原生用法与 neeko 混用的项目中，导致麻烦的错误
// 见 https://github.com/mobxjs/mobx/issues/1702
configure({
  enforceActions: 'always',
});
