import { clear } from '../__core'
import { resetRerenderCount } from '../__internal'

// clear before each text case
beforeEach(() => {
  clear()
  resetRerenderCount()
})
