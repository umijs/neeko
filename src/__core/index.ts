// 以下三行代码有副作用
import './init'
import '../plugins/watch'
import '../plugins/hooks'

export { default as model, isEffect, setEffect } from './neeko'
export { assertKeyValid } from '../__internal'
export { registerPlugin } from './plugin'
export { clear, register } from './di'
