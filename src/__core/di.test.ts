import { getInstance, register, clear, classType } from './di'

const mockInstanceFn = <T>(cls: classType<T>) => () => {
  return new cls()
}

class User {
  a = 1
}

class MockUser {
  a = '1'
}

const user = getInstance({}, mockInstanceFn(User))
const mockUser = getInstance({}, mockInstanceFn(MockUser))

// begin
describe('__core/di', () => {
  beforeEach(() => {
    clear()
  })
  it('should get user instance', () => {
    expect(user.a).toBe(1)
    user.a++
    expect(user.a).toBe(2)
  })

  it('should get mockUser instance by register', () => {
    expect(user.a).toBe(1)
    register(user.$uid, mockUser)
    expect(user.a).toBe('1')
  })

  it('should log error when not in test env', () => {
    const origin = console.error
    console.error = jest.fn()
    process.env.NODE_ENV = 'development'
    const user = getInstance({}, mockInstanceFn(User))
    const mockUser = getInstance({}, mockInstanceFn(MockUser))

    expect(user.a).toBe(1)
    // 在非测试环境不生效
    register(user.$uid, mockUser)
    expect(user.a).toBe(1)
    expect(console.error).toHaveBeenCalledWith(
      '[neeko]: cannot use testOnly api (register) without test env',
    )

    process.env.NODE_ENV = 'test'
    console.error = origin
  })
})
