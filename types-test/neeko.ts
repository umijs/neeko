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
    async fetch() {
      needNumber(this.a)
      this.$unstable_goto((index) => index++)
      this.$unstable_record()
      needNumber(this.$unstable_recordIndex)
      needNumber(this.$unstable_recordLength)
    },
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

needNumber(m.$unstable_recordIndex)
needNumber(m.$unstable_recordLength)
m.$unstable_record()
m.$unstable_goto((index: number) => index++)

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
      this.$unstable_goto((index) => index++)
      this.$unstable_record()
      needNumber(this.$unstable_recordIndex)
      needNumber(this.$unstable_recordLength)
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
