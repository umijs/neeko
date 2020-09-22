# Changelog

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
