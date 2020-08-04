import { clear } from '../__core'
import { resetRerenderCount } from '../__internal'

// 每一个测试用例跑完后恢复内存数据
beforeEach(() => {
  clear()
  resetRerenderCount()
})
