import { model } from 'okeen'
import color from './color'
import { Colors } from './color'

const user = model({
  state: {
    userInfo: {
      name: 'neeko',
      age: 0,
      id: '',
    },
  },
  computed: {
    stringifyUserInfo(): string {
      return JSON.stringify(this.userInfo)
    },
  },
  effects: {
    fetchUserInfo(id: string) {
      color.$update({
        currentColor: Colors.blue,
      })
      this.$update((state) => {
        state.userInfo.id = id
        state.userInfo.age += 1
      })
    },
  },
  watch: {
    'userInfo.age': {
      immediate: true,
      handler: function (a, b, d) {
        console.log('newValue: %s, oldValue: %s', a, b)
      },
    },
  },
})

export default user
