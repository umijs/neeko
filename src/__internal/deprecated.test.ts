import deprecated from './deprecated'

describe('__internal/deprecated', () => {
  it('should log when deprecated called', () => {
    const origin = console.error
    console.error = jest.fn()
    deprecated('aaa')
    expect(console.error).lastCalledWith('[neeko] Deprecated: aaa')
    deprecated('aaa', 'bbb')

    expect(console.error).lastCalledWith(
      "[neeko] Deprecated: 'aaa', use 'bbb' instead.",
    )

    console.error = origin
  })

  it('should log only once', () => {
    const origin = console.error
    console.error = jest.fn()
    // 注意这里与上一条共用同一个记录次数，所以这里选择 ccc 作为参数
    deprecated('ccc')
    deprecated('ccc')
    expect(console.error).toBeCalledTimes(1)

    console.error = origin
  })
})
