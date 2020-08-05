import deprecated from './deprecated'

describe('__internal/deprecated', () => {
  it('should log when deprecated called', () => {
    const origin = console.error
    console.error = jest.fn()
    deprecated('aaa')
    expect(console.error).lastCalledWith('[okeen] Deprecated: aaa')
    deprecated('aaa', 'bbb')

    expect(console.error).lastCalledWith(
      "[okeen] Deprecated: 'aaa', use 'bbb' instead.",
    )

    console.error = origin
  })

  it('should log only once', () => {
    const origin = console.error
    console.error = jest.fn()
    // the deprecated method does not have clear method,
    // so use anther key
    deprecated('ccc')
    deprecated('ccc')
    expect(console.error).toBeCalledTimes(1)

    console.error = origin
  })
})
