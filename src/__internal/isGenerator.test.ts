import isGenerator from './isGenerator'

describe('__internal/isGenerator', () => {
  it('should return true when generator', () => {
    expect(
      isGenerator(
        // @ts-ignore
        function* () {},
      ),
    ).toBeTruthy()

    expect(
      isGenerator(function* () {
        yield 1
      }),
    ).toBeTruthy()
  })

  it('should return false when !generator', () => {
    expect(isGenerator(null)).toBeFalsy()
    expect(isGenerator(1)).toBeFalsy()
    expect(isGenerator('1')).toBeFalsy()
    expect(isGenerator(function () {})).toBeFalsy()
    expect(isGenerator(async function () {})).toBeFalsy()
    expect(
      isGenerator(async function () {
        return Promise.resolve(1)
      }),
    ).toBeFalsy()
  })
})
