import { registerPlugin, model, isEffect, setEffect } from '../index'

declare module '../types' {
  interface IPlugins {
    toast?: {
      type: 'info' | 'error'
      fn: () => void
    }
  }
}

const setupToast = (
  ins: any,
  toast: any = {
    type: 'info',
  },
) => {
  // should get method on prototype
  for (const key in ins) {
    const original = ins[key]
    if (isEffect(original)) {
      setEffect(ins, key, (...args: any[]) => {
        toast.fn && toast.fn()
        return original(...args)
      })
    }
  }
}

describe('__core/plugin', () => {
  it('cannot register duplicate plugin', () => {
    registerPlugin('__aa__', () => null)

    expect(() => registerPlugin('__aa__', () => null)).toThrowError(
      '[okeen]: cannot register duplicate plugin (__aa__)',
    )

    expect(() => registerPlugin('state', () => null)).toThrowError(
      '[okeen]: cannot register plugin with reserved key (state)',
    )
  })

  it('register third plugin', () => {
    const mockFn = jest.fn()
    registerPlugin('toast', setupToast)
    const store = model({
      effects: {
        fetch() {},
      },
      plugins: {
        toast: {
          type: 'info',
          fn: mockFn,
        },
      },
    })

    expect(mockFn).toBeCalledTimes(0)
    expect(() => store.$update({})).not.toThrowError()
    store.fetch()
    expect(mockFn).toBeCalledTimes(1)
  })
})
