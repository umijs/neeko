<script lang="ts">
import Vue from 'vue';
import { observer } from '../src/vue';

function needExtend(res: typeof Vue.extend) {}

needExtend(observer);
</script>
