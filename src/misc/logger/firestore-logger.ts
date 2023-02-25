import { RAFirebaseOptions } from 'providers/options';
import { LoggerBase, LogNoOp } from './logger-base';

const LOGGER_ENABLEDKEY = 'LOGGING_FIRESTORE_COSTS_ENABLED';
const logger = new LoggerBase('💸firestore-costs:', LOGGER_ENABLEDKEY);

const KEY_SINGLE = 'firecosts-single-reads';

export interface IFirestoreLogger {
  logDocument: (count: number) => Function;
  SetEnabled: (isEnabled: boolean) => void;
  ResetCount: (shouldReset: boolean) => void;
}

export function MakeFirestoreLogger(
  options: RAFirebaseOptions
): IFirestoreLogger {
  function notEnabled() {
    return !options?.lazyLoading?.enabled;
  }

  function incrementRead(incrementBy = 1) {
    const currentCountRaw = localStorage.getItem(KEY_SINGLE) || '';
    const currentCount = parseInt(currentCountRaw) || 0;
    const incremented = currentCount + incrementBy;
    localStorage.setItem(KEY_SINGLE, incremented + '');
    return incremented;
  }
  function clearCache() {
    localStorage.removeItem(KEY_SINGLE);
  }
  return {
    SetEnabled(isEnabled: boolean) {
      logger.SetEnabled(isEnabled);
    },
    ResetCount(shouldReset: boolean) {
      shouldReset && clearCache();
    },
    logDocument(docCount: number) {
      if (notEnabled()) {
        return LogNoOp;
      }
      const count = incrementRead(docCount);
      const suffix = `+${docCount} (session total=${count} documents read)`;
      const boundLogFn: (...args: any) => void = logger.log.bind(
        console,
        suffix
      );
      return boundLogFn;
    },
  };
}
