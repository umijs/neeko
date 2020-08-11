## Getting Started

```tsx
import * as React from 'react'
import { model } from 'okeen'
import { observer } from 'okeen/react'

enum Colors {
  green = 'green',
  black = 'black',
  white = 'white',
  blue = 'blue'
}

const color = model({
  state: {
    currentColor: Colors.green
  },
  watch: {
    currentColor() {
      console.log("wow! I'm neeko")
    }
  }
})

const user = model({
  state: {
    userInfo: {
      name: 'neeko',
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
            name: 'neeko'
        }
    },
    effects: {
      reverseName() {
        this.$update({
          user: {
            ...this.user,
            name: this.user.name.split('').reverse().join('')
          }
        })
      }
    }
})

const useName = () => {
  React.useEffect(() => {
    m.reverseName()
  }, [])


  return <>{m.user.name}</>
}

const App = props => {
  const Name = useName()

  return <div>hello, {Name}</div>
}

export default observer(App)

```