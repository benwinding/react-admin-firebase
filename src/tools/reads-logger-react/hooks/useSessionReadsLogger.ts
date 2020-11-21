import { useEffect, useState } from 'react';
import { effectUtils } from './utils';
import { Subscription } from 'rxjs';

export const useSessionReadsLogger = () => {
  const [sessionReads, setSessionReads] = useState(0);
  const [lastSessionReads, setLastSessionReads] = useState(0);

  useEffect(() => {
    let sessionSubscription: Subscription = null as any,
      lastSessionSubscription: Subscription = null as any;
    effectUtils.init(
      'session',
      setSessionReads,
      setLastSessionReads
    ).then(([sessionSub, lastSessionSub]) => {
      sessionSubscription = sessionSub;
      lastSessionSubscription = lastSessionSub;
    });

    return () => effectUtils.clean(
      sessionSubscription,
      lastSessionSubscription
    );
  }, [setSessionReads, setLastSessionReads]);

  return [sessionReads, lastSessionReads];
};
