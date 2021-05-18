import {
  isObservableProp,
  isObservableMap,
  isObservable,
  isObservableSet,
} from 'mobx'

import './init'
import model from './neeko'
import { clear } from './di'

describe('__core/neeko', () => {
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
    // mobx 6 no longer throw Error
    // expect(store.fetch).toThrow()
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
      state.a = 2
      // trigger state.a getter for test coverage
      state.a += 1
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
  it('should update key in state', async () => {
    const store = model({
      state: {
        a: 1,
      } as { a: number; b: number },
    })

    expect(() =>
      store.$update({
        b: 1,
      }),
    ).toThrowError('[okeen]: cannot update key (b) not in state')
  })

  it('should throw error when duplicate key in model', () => {
    const x = model({
      state: {
        a: 1,
        update: 2,
      },
      computed: {
        a(): number {
          return 0
        },
      },
      effects: {
        a() {},
      },
    })
    expect(() => x.a).toThrowError(
      '[okeen]: cannot redefine key (a) in the model',
    )
  })

  it('should throw error when key start with $ in model', () => {
    const x = model({
      state: {
        $a: 1,
      },
    })

    expect(() => x.$a).toThrowError('[okeen]: cannot use key ($a) start with $')
  })

  it('should has $new on instance', async () => {
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

  it('should transfer function state', () => {
    const store = model({
      state: () => {
        return {
          a: 1,
        }
      },
    })

    expect(isObservableProp(store, 'a')).toBeTruthy()
    expect(store.a).toBe(1)

    const store2 = model({
      state() {
        return {
          a: 1,
          b: this,
        }
      },
    })

    expect(store2.b).toBe(undefined)
  })
  it('should work with record', () => {
    const store = model({
      state: {
        a: 1,
      },
    })
    expect(store.a).toBe(1)
    expect(store.$unstable_recordIndex).toBe(0)
    expect(store.$unstable_recordLength).toBe(0)

    store.$update((state) => state.a++)
    store.$unstable_record()
    expect(store.a).toBe(2)
    expect(store.$unstable_recordLength).toBe(1)

    store.$update((state) => state.a++)
    store.$unstable_record()
    expect(store.a).toBe(3)
    expect(store.$unstable_recordIndex).toBe(0)
    expect(store.$unstable_recordLength).toBe(2)

    store.$unstable_goto((index) => --index)
    expect(store.a).toBe(2)
    expect(store.$unstable_recordIndex).toBe(-1)
    expect(store.$unstable_recordLength).toBe(2)

    // record will delete next records
    store.$update((state) => (state.a = 4))
    store.$unstable_record()
    expect(store.a).toBe(4)
    expect(store.$unstable_recordIndex).toBe(0)
    expect(store.$unstable_recordLength).toBe(2)

    store.$unstable_goto((index) => --index)
    expect(store.a).toBe(2)
    expect(store.$unstable_recordIndex).toBe(-1)
    expect(store.$unstable_recordLength).toBe(2)

    // max length, no effect
    store.$unstable_goto((index) => --index)
    expect(store.a).toBe(2)
    expect(store.$unstable_recordIndex).toBe(-1)
    expect(store.$unstable_recordLength).toBe(2)

    // > 0 , no effect
    store.$unstable_goto((index) => 1)
    expect(store.a).toBe(2)
    expect(store.$unstable_recordIndex).toBe(-1)
    expect(store.$unstable_recordLength).toBe(2)

    store.$unstable_goto((index) => ++index)
    expect(store.a).toBe(4)
    expect(store.$unstable_recordIndex).toBe(0)
    expect(store.$unstable_recordLength).toBe(2)
  })
})
