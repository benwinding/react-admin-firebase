import { useCallback, useEffect, useState } from 'react';
import { effectUtils } from './utils';
import { Subscription } from 'rxjs';
import { getFirebaseReadsLogger } from './utils/getFirebaseReadsLogger';

export const useCustomReadsLogger = () => {
  const [customReads, setCustomReads] = useState(0);
  const [lastCustomReads, setLastCustomReads] = useState(0);

  useEffect(() => {
    let customSubscription: Subscription = null,
      lastCustomSubscription: Subscription = null;
    effectUtils.init(
      'custom',
      setCustomReads,
      setLastCustomReads
    ).then(([customSub, lastCustomSub]) => {
      customSubscription = customSub;
      lastCustomSubscription = lastCustomSub;
    });

    return () => effectUtils.clean(
      customSubscription,
      lastCustomSubscription
    );
  }, [setCustomReads, setLastCustomReads]);

  const resetCustomReads = useCallback(async () => {
    const logger = await getFirebaseReadsLogger();
    if (logger) {
      logger.resetCustomReads();
    }
  }, []);

  return [customReads, lastCustomReads, resetCustomReads];
};
