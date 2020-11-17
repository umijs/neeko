import { defineComponent } from 'vue'
import { autorun } from 'mobx'

const observer: typeof defineComponent = function (opts: any) {
  // for setup function case
  if (typeof opts === 'function') {
    opts = {
      setup: opts,
    }
  }

  let dispose: () => void
  const mounted = function (this: any) {
    // hack, collect by vue internal render api
    // hope this is stable
    const fn = () => {
      this.$.render(
        this.$.ctx,
        this.$.renderCache,
        this.$.ctx.$props,
        this.$.setupState,
        this.$.ctx.$data,
        this.$.ctx.$options,
      )

      this.$.ctx.$forceUpdate()
    }

    dispose = autorun(fn)
  }

  const unmounted = function () {
    dispose?.()
  }

  return defineComponent({
    ...opts,
    mounted() {
      opts?.mounted?.call(this)
      mounted.call(this)
    },
    unmounted() {
      opts?.unmounted?.call(this)
      unmounted.call(this)
    },
  })
}

export default observer
