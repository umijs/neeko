# Api

Simple is first in okeen，and it has easy api as model, observer <br /> Besides, all api is typed for coding

> Notice, `strict: true` is necessary in `tsconfig`  (at least `noImplicitThis: true` is required) for  `this` type check , or it is always `any`

Also react@^16.8.0 or vue@^3.0.0 or vue^2.6.0([https://github.com/vuejs/vue/issues/5893](https://github.com/vuejs/vue/issues/5893)) is required.

## model

model is most important in okeen

> Notice that key begin with \$ is reserved

```typescript
import { model } from 'okeen'

export default model({
  state: {
    name: 'okeen',
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
      // mock async fetch data
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

### state

state in model, initial data is required, and can be any of number, string, boolean, array, object, Map, Set。<br />

```typescript
type StateValue = number|string|boolean|Array|Map|Set|object|null|undefined

type State = {
  [key: string]: StateValue
}

type State = () => State

// normal state
{
  state: {
    a: 1,
    b: '1',
    c: true,
    d: [1,2,3],
    e: { name: 'okeen', age: 18 },
    f: new Map(),
    g: new Set()
  }
}

// function state
{
  state() {
    return {
      a: 1
    }
  }
}
```

> Notice with function state

- `this` in state is always undefined
- `() => {}` is better than `function() {}` when using `watch` props

### ref

Reference data just like React.useRef<br />

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

computed state

1. can not be updated by \$update method
2. should write return type in typescript
3. it must be pure function

```typescript
type Computed = {
  [key: string]: () => StateValue
}

{
  state: {
    a: 1,
  },
  computed: {
    // type number is necessary
    doubleA(): number {
      return this.a*2
    }
  }
}
```

### effects

Methods to handle syn/async action, notice that state can only be updated by \$update

```typescript
import { model } from 'okeen'

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
      // immediate callback handler
      immediate: true,
      // deep equal with === , but NaN === NaN
      deep: true,
      handler(newValue, oldValue, disposer) {}
    },
    'b.c': function(newValue, oldValue, disposer) {}
  }
}
```

### hooks

Auto call at next tick of model generated

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

### return

model's return value has all data or methods provided by state, computed, effects and \$update

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

observer for react/vue and okeen. adding observer for all components is no effect for performance

### react

```typescript
import { observer } from 'okeen/react'
import user from './stores/user'

const App: React.FC = (props) => {
  return (
    <>
      <p>{user.a}</p>
      <button type="button" onClick={user.fetchData}>
        Click
      </button>
    </>
  )
}

export default observer(App)
```

### vue3

```typescript
<template>
<div>
  <p>{{user.a}}</p>
  <button type="button" @click="user.fetchData">Click</button>
</div>
</template>

<script lang="ts">
import { observer } from 'okeen/vue'
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
