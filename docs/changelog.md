# Changelog

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
