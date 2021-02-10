# Plugins

Okeen has plugins，and okeen hooks and watch are wrote by okeen plugin

Notice that plugins are work for global

Toast as a sample

#### Options in model

```typescript
import { model } from 'okeen'

export default model({
  effects: {
    fetch() {},
  },
  // plugins options
  plugins: {
    // provide by toast plugin
    // toast is used by toast plugin
    toast: {
      type: 'error',
    },
  },
})
```

#### Code

```typescript
import { registerPlugin, isEffect, setEffect } from 'okeen'

// typed for plugin
declare module 'okeen/types' {
  interface IPlugins {
    toast?: {
      type: 'info' | 'error'
    }
  }
}

// options is global for a plugin, not used here
export default (options: any = {}) => {
  // ins is model, toast is plugins.toast in model
  const setupToast = (
    ins: any,
    toast = {
      type: 'info',
    },
  ) => {
    // should get method on prototype
  for (const key in ins) {
    const original = ins[key]

    if (isEffect(original)) {
      setEffect(ins, key, (...args) => {
        alert(`I'm alert by toast plugin, type: ${toast.type}`)
        return original(...args)
      })
    }
  }

  // register plugin by 'toast' key
  registerPlugin('toast', setupToast)
}
```

#### Add plugin

Before all okeen code

```typescript
import registerToast 'path/plugins/toast'
registerToast()
```

A tost plugin that alert before every effects is completed
