import assertKeyValid from './assertKeyValid'

describe('__internal/assertKeyValid', () => {
  it('should return false if ins is invalid', () => {
    expect(assertKeyValid(null, 'a')).toBeFalsy()
    expect(assertKeyValid(undefined, 'a')).toBeFalsy()
    expect(assertKeyValid('', 'a')).toBeFalsy()
    expect(assertKeyValid(0, 'a')).toBeFalsy()
  })

  it('should return true if the key is not on ins', () => {
    expect(assertKeyValid({}, 'a')).toBeTruthy()
    expect(assertKeyValid({ b: 1 }, 'a')).toBeTruthy()

    const fn = jest.fn()
    assertKeyValid({ b: 1 }, 'a', fn)
    expect(fn).toBeCalledTimes(1)
  })

  it('should return false if the key is on ins', () => {
    const origin = console.error
    // clear error log for terminal
    console.error = jest.fn()
    expect(assertKeyValid({ a: 1 }, 'a')).toBeFalsy()
    expect(assertKeyValid({ a: null }, 'a')).toBeFalsy()
    expect(assertKeyValid({ a: undefined }, 'a')).toBeFalsy()
    expect(assertKeyValid({ a: '' }, 'a')).toBeFalsy()
    expect(assertKeyValid({ a: 0 }, 'a')).toBeFalsy()

    console.error = jest.fn()
    const fn = jest.fn()
    assertKeyValid({ a: 1 }, 'a', fn)
    expect(fn).toBeCalledTimes(0)
    expect(console.error).toBeCalledWith(
      '[okeen]: cannot redefine key (a) in the model',
    )
    console.error = origin
  })

  it('should return false if the key start with $', () => {
    const origin = console.error
    // clear error log for terminal
    console.error = jest.fn()

    const fn = jest.fn()
    assertKeyValid({ a: 1 }, '$a', fn)
    expect(fn).toBeCalledTimes(0)
    expect(console.error).toBeCalledWith(
      '[okeen]: cannot use key ($a) start with $',
    )
    console.error = origin
  })
})
