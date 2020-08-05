import { configure } from 'mobx'

// 见 https://github.com/mobxjs/mobx/issues/1702
// use always for strict mode, thus state change is more safe
configure({
  enforceActions: 'always',
})
