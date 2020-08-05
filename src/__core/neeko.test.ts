import {
  isObservableProp,
  isObservableMap,
  isObservable,
  isObservableSet,
} from 'mobx'

import './init'
import model from './okeen'
import { clear } from './di'

describe('__core/okeen', () => {
  beforeEach(() => {
    clear()
  })

  it('two state', () => {
    const store1 = model({
      state: {
        a: 1,
      },
    })
    const store2 = model({
      effects: {
        x() {
          store1.$update({ a: store1.a + 1 })
        },
      },
    })

    expect(store1.a).toBe(1)
    store2.x()
    expect(store1.a).toBe(2)
  })

  it('should transfer state', () => {
    const store = model({
      state: {
        a: 1,
        b: {
          c: 2,
        },
        c: null,
        d: new Map(),
        e: new Set(),
      },
    })

    // a
    expect(isObservableProp(store, 'a')).toBeTruthy()
    expect(isObservable(store.a)).toBeFalsy()

    // b
    expect(isObservableProp(store, 'b')).toBeTruthy()
    expect(isObservable(store.b)).toBeTruthy()
    expect(isObservable(store.b.c)).toBeFalsy()

    // c
    expect(isObservableProp(store, 'c')).toBeTruthy()
    expect(isObservable(store.c)).toBeFalsy()

    // d
    expect(isObservableProp(store, 'd')).toBeTruthy()
    expect(isObservable(store.d)).toBeTruthy()
    expect(isObservableMap(store.d)).toBeTruthy()

    // e
    expect(isObservableProp(store, 'e')).toBeTruthy()
    expect(isObservable(store.e)).toBeTruthy()
    expect(isObservableSet(store.e)).toBeTruthy()
  })

  it('should transfer computed', () => {
    const store = model({
      state: {
        a: 1,
      },
      computed: {
        aa(): number {
          return this.a * 2
        },
      },
    })
    expect(store.a).toBe(1)
    expect(store.aa).toBe(2)
  })

  it('should transfer ref', () => {
    const store = model({
      state: {
        a: 1,
      },
      ref: {
        _timeout: null,
      },
    })
    expect(store._timeout).toBe(null)
  })

  it('should transfer effects', async () => {
    const store = model({
      state: {
        a: 1,
      },
      effects: {
        fetch() {
          this.$update({
            a: this.a + 1,
          })
        },
        async fetchAsync() {
          await Promise.resolve()
          this.$update({
            a: this.a + 2,
          })
        },
      },
    })

    expect(store.a).toBe(1)
    store.fetch()
    expect(store.a).toBe(2)
    await store.fetchAsync()
    expect(store.a).toBe(4)
  })

  it('should transfer effects by flow', function* () {
    const store = model({
      state: {
        a: 1,
      },
      effects: {
        *fetchGenerator() {
          yield Promise.resolve()
          this.$update({
            a: this.a + 3,
          })
        },
      },
    })

    expect(store.a).toBe(1)
    yield store.fetchGenerator()
    expect(store.a).toBe(4)
  })

  it('should not change state without update', () => {
    const store = model({
      state: {
        a: 1,
      },
      effects: {
        fetch() {
          // @ts-ignore
          this.a++
        },
      },
    })

    expect(store.a).toBe(1)
    expect(store.fetch).toThrow()
    expect(store.a).toBe(1)
  })
  it('should transfer update reducers', () => {
    const store = model({
      state: {
        a: 1,
        b: {
          bb: 1,
        },
      },
    })

    store.$update({ a: 2 })
    expect(store.a).toBe(2)

    store.$update((state) => {
      // state is Proxy，it is {}
      expect(state).toEqual({})
      state.a = 3
      state.b.bb = 2
      expect(state).toEqual({})
    })
    expect(store.a).toBe(3)
    expect(store.b.bb).toBe(2)
  })
  it('should update state nextTick', async () => {
    const store = model({
      state: {
        a: 1,
      },
    })

    store.$update({ a: 2 }, true)
    expect(store.a).toBe(1)
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(store.a).toBe(2)
  })
  it('should update key not in state', () => {
    const origin = console.error
    console.error = jest.fn()
    const store = model({
      state: {
        a: 1,
      } as { a: number; b: number },
    })

    store.$update({ b: 2 })
    expect(console.error).toBeCalledWith(
      '[okeen]: cannot update key (b) not in state',
    )
    expect(store.b).toBe(undefined)

    console.error = origin
  })

  it('should log error when duplicate key in model', () => {
    const origin = console.error
    console.error = jest.fn()
    const fn = console.error

    const x = model({
      state: {
        a: 1,
        update: 2,
      },
      computed: {
        a(): number {
          return 0
        },
        update(): number {
          return 0
        },
      },
      effects: {
        a() {},
        update() {},
      },
    })

    expect(x.a).toBe(1)
    expect(typeof x.$update === 'function').toBeTruthy()
    expect(fn).toHaveBeenNthCalledWith(
      1,
      '[okeen]: cannot redefine key (a) in the model',
    )
    expect(fn).toHaveBeenNthCalledWith(
      2,
      '[okeen]: cannot redefine key (update) in the model',
    )
    expect(fn).toHaveBeenNthCalledWith(
      3,
      '[okeen]: cannot redefine key (a) in the model',
    )
    expect(fn).toHaveBeenNthCalledWith(
      4,
      '[okeen]: cannot redefine key (update) in the model',
    )

    console.error = origin
  })

  it('should log error when key start with $ in model', () => {
    const origin = console.error
    console.error = jest.fn()
    const fn = console.error

    const x = model({
      state: {
        $a: 1,
      },
    })

    expect(fn).toHaveBeenNthCalledWith(
      1,
      '[okeen]: cannot use key ($a) start with $',
    )

    console.error = origin
  })

  it('should has $new on instance', () => {
    const store = model({
      state: {
        a: 1,
      },
    })

    store.$update({
      a: 2,
    })

    // generate new store by a store
    const store2 = store.$new()
    store2.$update({
      a: 3,
    })

    // $new store has no sideEffect of old store
    expect(store.a).toBe(2)
    expect(store2.a).toBe(3)
  })
})
