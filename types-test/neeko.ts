import {
  model,
  extendObservable,
  toJS,
  isEffect,
  setEffect,
  registerPlugin,
} from '../src'

function needNumber(p: number) {}

const m = model({
  state: {
    a: 1,
  },
  computed: {
    aa(): number {
      return this.a * 2
    },
  },
  effects: {
    async fetch() {},
  },
  hooks: {
    init() {
      this.fetch()
      this.$update({
        a: 2,
      })
      this.$update((state) => {
        state.a = 3
      })
    },
  },
  watch: {
    a(pre, next, disposer) {
      needNumber(pre)
      needNumber(next)
      disposer()
    },
  },
})

m.$update({
  a: 2,
})
m.$update((state) => {
  state.a = 3
})
m.fetch()
needNumber(m.aa)
needNumber(m.a)
m.$uid

const c: typeof m = m.$new()

extendObservable({}, {})
toJS(m.aa)
isEffect(m.fetch)
setEffect(m, 'x', () => {})
registerPlugin('pp', (ins: any, opt = {}) => {})

const n = model({
  state: () => {
    return {
      a: 1,
    }
  },
  computed: {
    aa(): number {
      return this.a * 2
    },
  },
  effects: {
    fetch() {
      needNumber(this.a)
    },
  },
  hooks: {
    init() {
      needNumber(this.a)
    },
  },
  watch: {
    a(pre, next, disposer) {
      needNumber(pre)
      needNumber(next)
      disposer()
    },
  },
})
