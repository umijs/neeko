import Vue from 'vue';
import { observer } from './mobx-vue';

const observerVue: typeof Vue.extend = observer;

export default observerVue;
