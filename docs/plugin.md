# 如何编写 Neeko 插件

Neeko 允许开发者编写属于自己的特殊逻辑，而 neeko 本身的 hooks, watch 本身就是用插件的方式编写的。<br />需要注意的是， Neeko 的插件都是全局生效的，暂时不存在为某个 model 单独开小灶的情况。

下面以一个 toast 插件为例。

#### model 中插件的参数配置

```typescript
import { model } from 'neeko'

export default model({
  effects: {
    fetch() {}
  },
  // plugins 提供自定义插件所需要的配置
  plugins: {
    // provide by toast plugin
    // toast 为插件占用的字段，该字段类型有插件提供者决定
    toast: {
      type: 'error'
    }
  }
})
```

#### 插件代码

```typescript
import { registerPlugin, isEffect, setEffect } from 'neeko'

// 为你的插件在 model 中的字段提供类型提示
declare module 'neeko/types' {
  interface IPlugins {
    toast?: {
      type: 'info' | 'error'
    }
  }
}

// 编写插件的逻辑
// options 为插件全局需要的配置，这里未用到
export default (options: any = {}) => {
  // 其中 ins 为 model 的 store 实例，toast 为你在上面 model 中写的 plugins.toast 的值
  const setupToast = (
    ins: any,
    toast = {
      type: 'info'
    }
  ) => {
    Object.keys(ins).forEach(key => {
      const original = ins[key]

      if (isEffect(original)) {
        setEffect(ins, key, (...args) => {
          alert(`I'm alert by toast plugin, type: ${toast.type}`)
          return original(...args)
        })
      }
    })
  }

  // 注册 toast 插件，占用 toast key
  registerPlugin('toast', setupToast)
}
```

#### 引入插件
在所有 model 之前引入插件代码，建议放在入口的顶部

```typescript
import registerToast 'path/plugins/toast'
registerToast()
```

这样，就实现了一个 toast 插件，该插件的作用是，在 neeko 的每个 effects 运行前 alert 一段文字。
