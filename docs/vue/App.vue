<template>
  <div>
    <div v-if="!user.lock">
      <p>userInfo: {{ user.stringifyUserInfo }}</p>
      <p>---------------------------</p>
      <p>color: {{ color.currentColor }}</p>
      <p>---------------------------</p>
    </div>
    <div v-else>locked</div>
    <button type="button" @click="() => user.fetchUserInfo('123456')">
      click
    </button>
    <button type="button" @click="user.unlock">unlock</button>
  </div>
</template>

<script lang="ts">
import { reactive, defineComponent } from 'vue'
import { user, color } from '../stores'
import { observer } from 'okeen/vue'

export default observer({
  data() {
    return {
      user,
    }
  },
  setup() {
    return {
      color,
    }
  },
})
</script>
