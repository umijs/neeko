// 用于组件测试的时候计算渲染次数

export { getRerenderCountByComponent } from '../__internal/rerenderCount';

export {
  // 用于 store 测试的时候，替换 store
  register,
} from '../__core';
