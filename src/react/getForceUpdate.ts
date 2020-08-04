import { useCallback, useState } from 'react';
import { isTestEnv } from '../__internal';

export default function getUseForceUpdate(fn: () => void) {
  function useForceUpdate() {
    const [, setTick] = useState(0);

    const update = useCallback(() => {
      setTick((tick) => tick + 1);

      // test only
      if (typeof fn === 'function' && isTestEnv()) {
        fn();
      }
    }, []);

    return update;
  }

  return useForceUpdate;
}
