import { model } from '../index'

describe('plugins/hooks', () => {
  it('should transfer hooks', async () => {
    const store = model({
      state: {
        a: 1,
      },
      hooks: {
        init() {
          this.$update({ a: this.a + 1 })
          // Special, this will case UnhandledPromiseRejectionWarning
          throw new Error()
        },
      },
    })

    expect(store.a).toBe(1)

    await Promise.resolve()
    expect(store.a).toBe(2)
  })
})
