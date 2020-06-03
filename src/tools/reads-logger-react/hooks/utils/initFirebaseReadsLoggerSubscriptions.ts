import { getFirebaseReadsLogger } from './getFirebaseReadsLogger';
import { SetStateAction, Dispatch } from 'react';
import { FiReLogger } from '../../../reads-logger';
type CounterType = 'page' | 'custom' | 'session';
type GetCounterKeysFn = (counterType: CounterType) => [string, string];
type InitLoggerCallbackFn = (logger: FiReLogger) => any |
  Promise<(logger: FiReLogger) => any>;

const getCounterKeys: GetCounterKeysFn = counterType => {
  switch (counterType) {
  case 'page':
    return ['pageReads', 'lastPageReads'];
  case 'custom':
    return ['customReads', 'lastCustomReads'];
  case 'session':
    return ['sessionReads', 'lastSessionReads'];
  }
};

const setReadsSubscriptions = async (
  logger: FiReLogger,
  counterType: CounterType,
  setCurrentReads: Dispatch<SetStateAction<number>>,
  setLastReads: Dispatch<SetStateAction<number>>
) => {
  const [currentCounterKey, lastCounterKey] = getCounterKeys(counterType);
  const currentCounterSubscription = logger.counters$[currentCounterKey]
    .subscribe(setCurrentReads);
  const lastCounterSubscription = logger.counters$[lastCounterKey]
    .subscribe(setLastReads);

  return [currentCounterSubscription, lastCounterSubscription];
};

export const initFirebaseReadsLoggerSubscriptions = async (
  counterType: CounterType,
  setCurrentReads: Dispatch<SetStateAction<number>>,
  setLastReads: Dispatch<SetStateAction<number>>,
  callback: InitLoggerCallbackFn = null
) => {
  const firebaseReadsLogger: FiReLogger | false =
    await getFirebaseReadsLogger();

  if (!firebaseReadsLogger) {
    throw Error();
  }

  const [
    currentCounterSubscription,
    lastCounterSubscription
  ] = await setReadsSubscriptions(
    firebaseReadsLogger,
    counterType,
    setCurrentReads,
    setLastReads
  );

  if (callback) {
    await Promise.resolve(callback(firebaseReadsLogger));
  }

  return [currentCounterSubscription, lastCounterSubscription];
};
