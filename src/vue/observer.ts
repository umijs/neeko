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
    // hope this is stable, and without effects
    const fn = () => {
      this.$.render(
        this,
        this.$.renderCache,
        this.$props,
        this.$.setupState,
        this.$data,
        this.$options,
      )

      this.$forceUpdate()
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
