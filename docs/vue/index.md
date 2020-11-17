### Vue3

```tsx
import * as React from 'react'
import * as Vue from 'vue'
import App from './App.vue'

export default () => {
  React.useEffect(() => {
    Vue.createApp(App).mount('#vue-root')
  }, [])

  return <div id="vue-root" />
}
```
