# okeen

[![codecov](https://codecov.io/gh/umijs/neeko/branch/master/graph/badge.svg)](https://codecov.io/gh/umijs/neeko) [![NPM version](https://img.shields.io/npm/v/okeen.svg?style=flat)](https://npmjs.org/package/okeen) [![CircleCI](https://circleci.com/gh/umijs/neeko/tree/master.svg?style=svg)](https://circleci.com/gh/umijs/neeko/tree/master) 

## Try It Online

### React
[![Edit](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/recursing-wescoff-hmx11)

### Vue
[![Edit](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/awesome-heyrovsky-t3x15)

## Getting Started

```bash
npm i okeen
```

### common/stores/color.ts
```typescript
import { model } from 'okeen'

export enum Colors {
  green = 'green',
  black = 'black',
  white = 'white',
  blue = 'blue'
}

export default model({
  state: {
    currentColor: Colors.green
  },
  watch: {
    currentColor() {
      console.log("wow! I'm neeko")
    }
  }
})

```

### common/stores/user.ts
```typescript
import { model } from 'okeen'
import color, { Colors } from './color'

export default model({
  state: {
    userInfo: {
      name: '',
      age: 0,
      id: ''
    }
  },
  computed: {
    stringifyUserInfo(): string {
      return JSON.stringify(this.userInfo)
    }
  },
  effects: {
    fetchUserInfo(id: string) {
      color.$update({
        currentColor: Colors.blue
      })
      this.$update(state => {
        state.userInfo.id = id
        state.userInfo.age += 1
      })
    }
  },
  watch: {
    'userInfo.age': {
      immediate: true,
      handler: function(a, b, d) {
        console.log('newValue: %s, oldValue: %s', a, b)
      }
    }
  }
})

```

### react/App.tsx
```typescript
import * as React from 'react'
import { Button } from 'antd-mobile'
import { observer } from 'okeen/react'
import user from '@/common/stores/user'
import color from '@/common/stores/color'

const App: React.FC = props => {
  const { fetchUserInfo, stringifyUserInfo } = user
  const { currentColor } = color
  console.log('render')
  return (
    <>
      <p>userInfo: {stringifyUserInfo}</p>
      <p>---------------------------</p>
      <p>color: {currentColor}</p>
      <p>---------------------------</p>
      <Button onClick={() => fetchUserInfo('123456')}>click</Button>
    </>
  )
}

export default observer(App)

```

### vue/App.vue
```vue
<template>
  <div>
    <p>userInfo: {{ user.stringifyUserInfo }}</p>
    <p>---------------------------</p>
    <p>color: {{ color.currentColor }}</p>
    <p>---------------------------</p>
    <button
      type="button"
      @click="() => user.fetchUserInfo('123456')"
    >
      click
    </button>
  </div>
</template>

<script lang="ts">
import { observer } from 'okeen/vue'
import user from '@/common/stores/user'
import color from '@/common/stores/color'

export default observer({
  data() {
    return {
      user,
      color
    }
  }
})
</script>

```

## LICENSE

[MIT](https://github.com/umijs/neeko/blob/master/LICENSE)
