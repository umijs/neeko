# Api

Neeko 遵从简单易用的原则，在 api 上保持精炼，具体分为 model, observer 两个<br />此外 Neeko 的 api 都是类型完备的，在使用过程中有非常良好的开发体验。

> 注意，在 `tsconfig`  中你需要引入  `strict: true` (或者至少  `noImplicitThis: true`，这是  `strict`  模式的一部分) 以利用组件方法中  `this`  的类型检查，否则它会始终被看作  `any`  类型

同时，对于 react 要求 ^16.8.0（暂时没有做之前版本的适配），vue 要求 ^2.6.0（[https://github.com/vuejs/vue/issues/5893](https://github.com/vuejs/vue/issues/5893)）<br />

## model

model 是 Neeko 中重要的概念，一个完整的 model 如下，

> 注意不要使用 \$开头的字段，未来会更改为保留字段

```typescript
import { model } from 'neeko'

export default model({
  state: {
    name: 'Neeko',
    age: 0,
  },
  ref: {
    _t: null,
  },
  computed: {
    helloWithName(): string {
      return `hello ${this.name}!`
    },
  },
  effects: {
    async fetchData() {
      // 模拟异步请求数据
      const data = await fetch()
      this.$update({
        age: data.age,
      })
    },
  },
  watch: {
    age() {
      console.log(this.age)
    },
  },
  hooks: {
    init() {
      this.fetchData()
    },
  },
})
```

<br />model 有如下属性<br />

### state

状态数据，包含初始值，数据变更总是需要先有数据。每个值可以是 number, string, boolean, array, object, Map, Set。<br />

```typescript
type StateValue = number|string|boolean|Array|Map|Set|object|null|undefined

type State = {
  [key: string]: StateValue
}

{
  state: {
    a: 1,
    b: '1',
    c: true,
    d: [1,2,3],
    e: { name: 'neeko', age: 18 },
    f: new Map(),
    g: new Set()
  }
}
```

### ref

内存数据，用于存储临时变量，类似于 useRef<br />

```typescript
model({
  state: {},
  ref: {
    _timeout = null,
  },
  effects: {
    fetch() {
      this._timeout = setTimeout(() => {}, 2000)
    },
    cancel() {
      if (this._timeout) clearTimeout(this._timeout)
    },
  },
})
```

### computed

计算属性，通过 state 值做一些处理，返回另外一个值(该值不能被 update 更新，也不能再 state 里面呗预先定义)。<br />熟悉 vue 的可以和 vue 的 computed 联系在一起，两者在用法上没有区别。<br />如果你使用 typescript ，那么需要显示定义其返回类型。<br />另外需要注意的是，保持 computed 的纯函数，同步的特性。<br />

```typescript
type Computed = {
  [key: string]: () => StateValue
}

{
  state: {
    a: 1,
  },
  computed: {
    // 注意这里需要显示定义返回类型
    doubleA(): number {
      return this.a*2
    }
  }
}
```

### effects

以 key/value 格式定义 effect。用于处理同步/异步操作和业务逻辑，唯一可以更新状态的 api `this.$update` ，需要注意的是，这里只能更新在 state 字段中预先定义的值<br />

```typescript
import { model } from 'neeko'

type Effects = {
  [key: string]: (...args: any[]) => any
}

type $update = (state: Partial<State>) => void | (updater: (state: State) => void) => void

model({
  state: {
    a: 1
  },
  effects: {
    async fetchData() {
      const data = await fetch()
      this.$update({
        a: data.a
      })

      this.$update(state => {
        state.a = data.a
      })
    }
  }
})
```

```typescript
type Watch = {
  [key: string]: () => any|Promise<any>
}

{
  state: {
    a: 1,
    b: {
      c: 2
    }
  },
  watch: {
    a(newValue, oldValue, disposer) {
      console.log('a has been changed')
      disposer()
    },
    a: {
      // 初始化的时候就触发回调
      immediate: true,
      // 新旧两个值做 deep 比较触发 watch，默认是 === 比较，但是认为 NaN === NaN
      deep: true,
      handler(newValue, oldValue, disposer) {}
    },
    'b.c': function(newValue, oldValue, disposer) {}
  }
}
```

### hooks

生命周期，目前只提供一个初始化的生命周期 init ，用于替代 componentDidMount(react), didMount(vue)<br />

```typescript
type Hooks = {
  init: () => any|Promise<any>
}

{
  state: {
    a: 1
  },
  effects: {
    async fetchData() {}
  },
  hooks: {
    init() {
      this.fetchData()
    }
  }
}
```

### 返回值

model 的返回值除了拥有全部的 state, computed, effects 值或方法以及更改状态的 \$update 方法，可以用于在组件内部或其他 model 内部使用<br />

```typescript
const user = model({
  state: {
    a: 1,
  },
  computed: {
    doubleA(): number {
      return this.a * 2
    },
  },
  effects: {
    fetchData() {
      this.$update({
        a: this.a + 1,
      })
    },
  },
})

// 返回值使用
user.state // number
user.doubleA // number
user.fetchData()
user.$update(state)
```

## observer

用于连接 Neeko model 和 react/vue ，使得当 model state 发生变化后，触发 react/vue 依赖了 model state 组件重新渲染<br />为了减少 tnpm 包的数量以及减轻使用者的负担，把 react,vue 的 observer 放在同一个仓库里。同时为了保持 tree-shaking 的效果，在引入的时候作区分，而不是在运行时区分。<br />由于 observer 所做的工作对性能毫无影响，因此建议每个组件都加上 observer 以免发生忘记加导致不符合预期的问题。

### react

```typescript
import { observer } from 'neeko/react'
import user from './stores/user'

const App: React.FC = (props) => {
  return (
    <>
      <p>{user.a}</p>
      <button type="button" onClick={user.fetchData}>
        点我
      </button>
    </>
  )
}

export default observer(App)
```

### vue

```typescript
<template>
<div>
  <p>{{user.a}}</p>
  <button type="button" @click="user.fetchData">点我</button>
</div>
</template>

<script lang="ts">
import { observer } from 'neeko/vue'
import user from './stores/user'

export default observer({
  data() {
    return {
      user
    }
  }
})
</script>
```
