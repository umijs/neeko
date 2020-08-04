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
  Object.keys(ins).forEach((key) => {
    const original = ins[key]

    if (isEffect(original)) {
      setEffect(ins, key, (...args: any[]) => {
        toast.fn && toast.fn()
        return original(...args)
      })
    }
  })
}

describe('__core/plugin', () => {
  it('cannot register duplicate plugin', () => {
    const origin = console.error
    console.error = jest.fn()
    registerPlugin('__aa__', () => null)
    registerPlugin('__aa__', () => null)
    expect(console.error).toBeCalledWith(
      '[neeko]: cannot register duplicate plugin (__aa__)',
    )
    registerPlugin('state', () => null)
    expect(console.error).toBeCalledWith(
      '[neeko]: cannot register plugin with reserved key (state)',
    )
    console.error = origin
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
    store.fetch()
    expect(mockFn).toBeCalledTimes(1)
  })
})
