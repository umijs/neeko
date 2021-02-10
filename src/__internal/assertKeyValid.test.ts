import assertKeyValid from './assertKeyValid'

describe.only('__internal/assertKeyValid', () => {
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

  it('should throw error if the key is on ins', () => {
    expect(() => assertKeyValid({ a: 1 }, 'a')).toThrowError(
      '[okeen]: cannot redefine key (a) in the model',
    )
    expect(() => assertKeyValid({ a: null }, 'a')).toThrowError(
      '[okeen]: cannot redefine key (a) in the model',
    )
    expect(() => assertKeyValid({ a: undefined }, 'a')).toThrowError(
      '[okeen]: cannot redefine key (a) in the model',
    )
    expect(() => assertKeyValid({ a: '' }, 'a')).toThrowError(
      '[okeen]: cannot redefine key (a) in the model',
    )
    expect(() => assertKeyValid({ a: 0 }, 'a')).toThrowError(
      '[okeen]: cannot redefine key (a) in the model',
    )
  })

  it('should throw error if the key start with $', () => {
    expect(() => assertKeyValid({ a: 1 }, '$a')).toThrowError(
      '[okeen]: cannot use key ($a) start with $',
    )
  })
})
