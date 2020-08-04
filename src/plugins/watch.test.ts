import { model } from '../index'

describe('plugins/watch', () => {
  it('should transfer watch', async () => {
    let newValueA, oldValueA

    const changeA = jest.fn()
    const changeB = jest.fn()
    const changeBC = jest.fn()
    const changeC = jest.fn()

    const store = model({
      state: {
        a: 1,
        b: {
          c: 2,
        },
        c: {
          d: 1,
        },
      },
      effects: {
        fetch() {
          this.$update({
            a: this.a + 1,
            b: { ...this.b, c: this.b.c + 1 },
            c: { d: 1 },
          })
        },
      },
      watch: {
        a: {
          immediate: true,
          // 这里类型不对是因为后面 x: {} 的缘故，忽略
          // @ts-ignore
          handler(newValue, oldValue) {
            newValueA = newValue
            oldValueA = oldValue
            changeA()
          },
        },
        b: changeB,
        'b.c': changeBC,
        c: {
          deep: true,
          handler: changeC,
        },
        x: {},
      },
    })

    store.fetch()

    // wait 50ms for changed
    await new Promise((resolve) => {
      setTimeout(resolve, 50)
    })

    expect(changeA).toBeCalledTimes(2)
    expect(newValueA).toBe(2)
    expect(oldValueA).toBe(1)
    expect(changeB).toBeCalledTimes(1)
    expect(changeBC).toBeCalledTimes(1)
    expect(changeC).toBeCalledTimes(0)
  })
})
