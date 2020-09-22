# Okeen

[![codecov](https://codecov.io/gh/umijs/neeko/branch/master/graph/badge.svg)](https://codecov.io/gh/umijs/neeko) [![NPM version](https://img.shields.io/npm/v/okeen.svg?style=flat)](https://npmjs.org/package/okeen) [![CircleCI](https://circleci.com/gh/umijs/neeko/tree/master.svg?style=svg)](https://circleci.com/gh/umijs/neeko/tree/master)

## Try It Online

### React

[![Edit](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/recursing-wescoff-hmx11)

### Vue

[![Edit](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/awesome-heyrovsky-t3x15)

## Getting Started

```tsx
import * as React from 'react'
import { model } from 'okeen'
import { observer } from 'okeen/react'

enum Colors {
  green = 'green',
  black = 'black',
  white = 'white',
  blue = 'blue',
}

const color = model({
  state: {
    currentColor: Colors.green,
  },
  watch: {
    currentColor() {
      console.log("wow! I'm neeko")
    },
  },
})

const user = model({
  state: {
    userInfo: {
      name: 'neeko',
      age: 0,
      id: '',
    },
  },
  computed: {
    stringifyUserInfo(): string {
      return JSON.stringify(this.userInfo)
    },
  },
  effects: {
    fetchUserInfo(id: string) {
      color.$update({
        currentColor: Colors.blue,
      })
      this.$update((state) => {
        state.userInfo.id = id
        state.userInfo.age += 1
      })
    },
  },
  watch: {
    'userInfo.age': {
      immediate: true,
      handler: function (a, b, d) {
        console.log('newValue: %s, oldValue: %s', a, b)
      },
    },
  },
})

const App: React.FC = (props) => {
  const { fetchUserInfo, stringifyUserInfo } = user
  const { currentColor } = color
  console.log('render')
  return (
    <>
      <p>userInfo: {stringifyUserInfo}</p>
      <p>---------------------------</p>
      <p>color: {currentColor}</p>
      <p>---------------------------</p>
      <button onClick={() => fetchUserInfo('123456')}>click</button>
    </>
  )
}

export default observer(App)
```

```tsx
import * as React from 'react'
import { model } from 'okeen'
import { observer } from 'okeen/react'

const m = model({
  state: {
    user: {
      name: 'neeko',
    },
  },
  effects: {
    reverseName() {
      this.$update({
        user: {
          ...this.user,
          name: this.user.name.split('').reverse().join(''),
        },
      })
    },
  },
})

const useName = () => {
  React.useEffect(() => {
    m.reverseName()
  }, [])

  return <>{m.user.name}</>
}

const App = (props) => {
  const Name = useName()

  return <div>hello, {Name}</div>
}

export default observer(App)
```
