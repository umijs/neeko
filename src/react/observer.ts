import { observer } from './observer_by_mobx_react_lite'
import getUseForceUpdate from './getForceUpdate'
import { rerenderCallback } from '../__internal'

export default <T extends object>(baseComponent: React.FC<T>) => {
  const useForceUpdate = getUseForceUpdate(rerenderCallback)
  return observer<T>(baseComponent, { useForceUpdate })
}
