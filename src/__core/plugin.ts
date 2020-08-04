// internal 表示内部插件，比如 hooks, watch, 配置字段不在 plugins 里
// 外部只能配置 third 插件，配置字段全部收敛到 plugins 字段里
type pluginType = 'internal' | 'third';

export const plugins: Array<{
  type: pluginType;
  key: string;
  fn: (ins: any, obj: any) => void;
}> = [];

const usedKeys = [
  // 下面的字段以备不时之需
  'state',
  'computed',
  'effects',
  'update',
];

export function registerPlugin(
  key: string,
  fn: (ins: any, obj: any) => void,
  type: pluginType = 'third',
) {
  if (usedKeys.indexOf(key) !== -1) {
    console.error(`[neeko]: cannot register plugin with reserved key (${key})`);
    return;
  }

  if (plugins.filter((item) => item.key === key).length > 0) {
    console.error(`[neeko]: cannot register duplicate plugin (${key})`);
    return;
  }
  plugins.push({
    key,
    type,
    fn,
  });
}
