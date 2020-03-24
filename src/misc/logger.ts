import { RAFirebaseOptions } from "providers/RAFirebaseOptions";

// UTILS

export class SimpleLogger {
  private title = "🔥r-a-f: ";

  isEnabled() {
    return !!localStorage.getItem('LOGGING_ENABLED');
  }

  public get log() {
    if (!this.isEnabled()) {
      return (...any) => {};
    }
    const boundLogFn: (...any) => void = console.log.bind(console, this.title);
    return boundLogFn;
  }

  public get warn() {
    if (!this.isEnabled()) {
      return (...any) => {};
    }
    const boundLogFn: (...any) => void = console.warn.bind(console, this.title);
    return boundLogFn;
  }

  public get error() {
    if (!this.isEnabled()) {
      return (...any) => {};
    }
    const boundLogFn: (...any) => void = console.error.bind(
      console,
      this.title
    );
    return boundLogFn;
  }
}

const logger = new SimpleLogger();

export function CheckLogging(config: {}, options: RAFirebaseOptions) {
  const logSignalDeprecated = config && config["debug"];
  const logSignal = options.logging;
  if (logSignalDeprecated || logSignal) {
    localStorage.setItem('LOGGING_ENABLED', 'true')
  } else {
    localStorage.removeItem('LOGGING_ENABLED')
  }
}

export const log = logger.log;
export const logWarn = logger.warn;
export const logError = logger.error;
