<template>
  <div>
    <p>userInfo: {{ user.stringifyUserInfo }}</p>
    <p>---------------------------</p>
    <p>color: {{ color.currentColor }}</p>
    <p>---------------------------</p>
    <button type="button" @click="() => user.fetchUserInfo('123456')">
      click
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
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
