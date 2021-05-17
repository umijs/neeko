# Okeen

[![codecov](https://codecov.io/gh/umijs/neeko/branch/master/graph/badge.svg)](https://codecov.io/gh/umijs/neeko) [![NPM version](https://img.shields.io/npm/v/okeen.svg?style=flat)](https://npmjs.org/package/okeen) [![CircleCI](https://circleci.com/gh/umijs/neeko/tree/master.svg?style=svg)](https://circleci.com/gh/umijs/neeko/tree/master)

## Try It Online

### React

[![Edit](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/recursing-wescoff-hmx11)

### Vue3

[![Edit](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/infallible-andras-yihm2)

## Getting Started

```tsx
import * as React from 'react'
import { model } from 'okeen'
import { observer } from 'okeen/react'
import { color, user } from './stores'

console.log(color, user)

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

# Undo/Redo

```tsx
import * as React from 'react'
import { model, goto, record } from 'okeen'
import { observer } from 'okeen/react'

const m = model({
  state: {
    n: 0,
  },
  effects: {
    plus() {
      this.$update((state) => {
        state.n++
      })
      if (this.n%2 === 0) {
        record()
      }
    },
  },
})

const App = (props) => {
  return (
    <>
      <div>hello, {m.n}</div>
      <button onClick={() => goto((index) => index - 1)}>undo</button>
      <button onClick={m.plus}>plus</button>
      <button onClick={() => goto((index) => index + 1)}>redo</button>
    </>
  )
}

export default observer(App)
```
