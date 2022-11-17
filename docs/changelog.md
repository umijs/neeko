# Changelog

## [2.1.0](https://github.com/umijs/neeko/releases/tag/2.1.0)(2022-11-17)

### Features

- add Record and Goto for Undo/Redo as follow
```tsx | pure
const m = model({
  state: {
    n: 0,
  },
  computed: {
    disabledUndo(): boolean {
      return this.$unstable_recordIndex - 1 <= -this.$unstable_recordLength
    },
    disabledRedo(): boolean {
      return this.$unstable_recordIndex + 1 > 0
    },
  },
  effects: {
    plus() {
      this.$update((state) => {
        state.n++
      })
      if (this.n % 2 === 0) {
        this.$unstable_record()
      }
    },

    undo() {
      this.$unstable_goto((index) => index - 1)
    },

    redo() {
      this.$unstable_goto((index) => index + 1)
    },
  },
})

const App = (props) => {
  const {
    n,
    plus,
    undo,
    redo,
    disabledUndo,
    disabledRedo,
    $unstable_recordIndex,
    $unstable_recordLength,
  } = m
  return (
    <>
      <div>
        hello, n: {n}
        <br />
        recordLength: {$unstable_recordLength}
        <br />
        recordIndex: {$unstable_recordIndex}
      </div>
      <button disabled={disabledUndo} onClick={undo}>
        undo
      </button>
      <button onClick={plus}>plus</button>
      <button disabled={disabledRedo} onClick={redo}>
        redo
      </button>
    </>
  )
}
```

### Bug Fixes

- fix setEffect when use define plugin

## [2.0.0](https://github.com/umijs/neeko/releases/tag/2.0.0)(2021-02-10)

### Internal

- Move effects method on store.prototype

### Breaking Change

- All console.error in prev version `throw Error` now

  - key startsWith $
  - duplicate key
  - reserved key
  - update key not in state

  - duplicate plugin key
  - reserved plugin key

  - testOnly api such as register

- Now you should use `for in` to get effect and update it for custom plugin

- Now `setEffect` does not support generator(`function*{}`)

- Not support vue@2.x

## [1.2.1](https://github.com/umijs/neeko/releases/tag/1.2.1)(2020-11-17)

### Bug Fixes

Vue: fix observer collect error when env=production

## [1.2.0](https://github.com/umijs/neeko/releases/tag/1.2.0)(2020-11-17)

### Features

Vue: vue@^3 is compatibility

### Breaking Change

- Vue2: remove observer support for options, and you don't need it for vue2 will auto update for data

- remove testing api `getRerenderCountByComponent`

### Internal

Dependencies: Upgrade dependencies mobx to 6 and mobx-react to 7

## [1.0.1](https://github.com/umijs/neeko/releases/tag/1.0.0)(2020-09-22)

### Features

State: add function state as follow

```typescript | pure
// normal
model({
  state: {
    a: 1,
  },
})

// function
model({
  state: () => {
    return {
      a: 1,
    }
  },
})
```

## [1.0.0](https://github.com/umijs/neeko/releases/tag/1.0.0)(2020-08-11)

First release
