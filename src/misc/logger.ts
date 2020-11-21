import { RAFirebaseOptions } from '../providers/options';

type LogFn = (...args: any) => void;

const disabledLogFn: LogFn = () => null;

class SimpleLogger {
  title = 'raf:';
  isEnabled() {
    return !!localStorage.getItem('LOGGING_ENABLED');
  }

  public get log() {
    if (!this.isEnabled()) {
      return (...args: any) => {};
    }
    const boundLogFn: (...args: any) => void = console.log.bind(
      console,
      this.title
    );
    return boundLogFn;
  }

  public get warn() {
    if (!this.isEnabled()) {
      return (...args: any) => {};
    }
    const boundLogFn: (...args: any) => void = console.warn.bind(
      console,
      this.title
    );
    return boundLogFn;
  }

  public get error() {
    if (!this.isEnabled()) {
      return (...args: any) => {};
    }
    const boundLogFn: (...args: any) => void = console.error.bind(
      console,
      this.title
    );
    return boundLogFn;
  }
}

const logger = new SimpleLogger();

export const log = logger.log;
export const logError = logger.error;
export const logWarn = logger.warn;

export function CheckLogging(
  config: {} & { debug?: boolean },
  options: RAFirebaseOptions
) {
  const logSignalDeprecated = config && config.debug;
  const logSignal = options && options.logging;
  if (logSignalDeprecated || logSignal) {
    localStorage.setItem('LOGGING_ENABLED', 'true');
  } else {
    localStorage.removeItem('LOGGING_ENABLED');
  }
}
